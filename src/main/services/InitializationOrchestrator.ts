import { EventEmitter } from 'events'
import { createLogger } from '../utils/logger'
import { WeChatDetectionService, WeChatKeyService, WeChatDatabaseService } from './wechat'
import { ProcessService } from './process/ProcessService'
import { ChatlogApiService } from './api/ChatlogApiService'
import { ConfigService } from './ConfigService'
import {
  InitializationStep,
  InitializationStatus,
  InitializationState,
  InitializationStepInfo,
  InitializationResult,
  INITIALIZATION_STEPS_CONFIG,
  InitializationError,
  ERROR_MESSAGES,
  USER_ACTION_MESSAGES
} from '../types/initialization'

const logger = createLogger('InitializationOrchestrator')

// 服务依赖接口
export interface ServiceDependencies {
  configService: ConfigService
  wechatDetectionService: WeChatDetectionService
  databaseService: WeChatDatabaseService
  processService: ProcessService
  keyService: WeChatKeyService
  apiService: ChatlogApiService
  chatlogPath: string
}

export class InitializationOrchestrator extends EventEmitter {
  private services: ServiceDependencies
  private state: InitializationState
  private isRunning = false

  constructor(services: ServiceDependencies) {
    super()
    this.services = services
    this.state = this.createInitialState()
    this.setupServiceListeners()
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): InitializationState {
    const steps: Record<InitializationStep, InitializationStepInfo> = {} as any

    Object.values(InitializationStep).forEach((step) => {
      const config = INITIALIZATION_STEPS_CONFIG[step]
      steps[step] = {
        step,
        status: InitializationStatus.PENDING,
        progress: 0,
        title: config.title,
        description: config.description,
        canRetry: true
      }
    })

    return {
      currentStep: InitializationStep.CHECKING_WECHAT,
      steps,
      overallProgress: 0,
      isCompleted: false,
      canExit: false
    }
  }

  /**
   * 设置服务监听器
   */
  private setupServiceListeners(): void {
    // 监听密钥获取进度
    this.services.keyService.on('progress', (_progress: any) => {
      this.updateStepProgress(InitializationStep.GETTING_KEY, 50) // 简化进度计算
    })

    // 监听数据库解密进度
    this.services.databaseService.on('progress', (progress: any) => {
      this.updateStepProgress(InitializationStep.DECRYPTING_DATABASE, progress.progress)
    })

    // 监听进程状态变化
    this.services.processService.on('statusChanged', (statusInfo) => {
      if (statusInfo.newStatus === 'running') {
        this.updateStepStatus(
          InitializationStep.STARTING_SERVICE,
          InitializationStatus.SUCCESS,
          100
        )
      }
    })

    // 监听微信状态变化
    this.services.wechatDetectionService.on('statusChanged', (isRunning) => {
      if (this.state.currentStep === InitializationStep.CHECKING_WECHAT) {
        if (isRunning) {
          this.executeStep(InitializationStep.CHECKING_WECHAT)
        }
      }
    })
  }
  /**
   * 开始初始化流程
   */
  async startInitialization(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Initialization is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting initialization process')

    try {
      // 检查是否已经完成过初始化
      if (await this.checkExistingConfiguration()) {
        this.completeInitialization()
        return
      }

      // 执行完整的初始化流程
      await this.runInitializationSteps()
    } catch (error) {
      logger.error('Initialization failed:', error)
      this.handleStepError(this.state.currentStep, error as Error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * 检查现有配置
   */
  private async checkExistingConfiguration(): Promise<boolean> {
    const workDir = this.services.configService.getChatlogWorkDir()

    // 仅要求存在工作目录
    if (!workDir) {
      logger.info('No existing configuration found')
      return false
    }

    // 检查数据库是否已解密
    const hasDecryptedData = await this.services.databaseService.checkDecryptedData(workDir)
    if (!hasDecryptedData) {
      logger.info('No decrypted data found, need to run full initialization')
      return false
    }

    // 尝试启动服务
    const processConfig = {
      executable: this.services.chatlogPath,
      args: ['server', '--work-dir', workDir, '--addr', '127.0.0.1:5030']
    }

    const startResult = await this.services.processService.startProcess(processConfig)
    if (startResult.success) {
      logger.info('Successfully started with existing configuration')
      return true
    }

    logger.info('Failed to start with existing configuration, running full initialization')
    return false
  }

  /**
   * 执行初始化步骤
   */
  private async runInitializationSteps(): Promise<void> {
    const steps = [
      InitializationStep.CHECKING_WECHAT,
      InitializationStep.GETTING_KEY,
      InitializationStep.DECRYPTING_DATABASE,
      InitializationStep.STARTING_SERVICE
    ]

    for (const step of steps) {
      await this.executeStep(step)

      if (this.state.steps[step].status === InitializationStatus.ERROR) {
        return
      }
    }

    this.completeInitialization()
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(step: InitializationStep): Promise<void> {
    this.updateStepStatus(step, InitializationStatus.IN_PROGRESS)

    try {
      let result: InitializationResult

      switch (step) {
        case InitializationStep.CHECKING_WECHAT:
          result = await this.checkWeChat()
          break
        case InitializationStep.GETTING_KEY:
          result = await this.getWeChatKey()
          break
        case InitializationStep.DECRYPTING_DATABASE:
          result = await this.decryptDatabase()
          break
        case InitializationStep.STARTING_SERVICE:
          result = await this.startService()
          break
        default:
          throw new Error(`Unknown step: ${step}`)
      }

      if (result.success) {
        this.updateStepStatus(step, InitializationStatus.SUCCESS, 100)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.handleStepError(step, error as Error)
      throw error
    }
  }

  /**
   * 检查微信状态
   */
  private async checkWeChat(): Promise<InitializationResult> {
    const isRunning = await this.services.wechatDetectionService.isWeChatRunning()

    if (!isRunning) {
      this.updateStepUserAction(InitializationStep.CHECKING_WECHAT, 'start_wechat')
      return {
        success: false,
        message: ERROR_MESSAGES[InitializationError.WECHAT_NOT_RUNNING]
      }
    }

    const processResult = await this.services.wechatDetectionService.getWeChatProcesses()
    if (processResult.success && processResult.data) {
      return {
        success: true,
        message: `Found ${processResult.data.length} WeChat process(es)`,
        data: processResult.data
      }
    }

    return {
      success: false,
      message: 'Failed to detect WeChat processes'
    }
  }

  /**
   * 获取微信密钥
   */
  private async getWeChatKey(): Promise<InitializationResult> {
    // 检查是否已有保存的密钥
    const savedKey = this.services.configService.getWeChatKey()
    if (savedKey) {
      logger.info('Using saved WeChat key')
      return { success: true, message: 'Using saved key' }
    }

    // 使用密钥服务获取新密钥
    const result = await this.services.keyService.getWeChatKey(this.services.chatlogPath)

    if (result.success && result.key) {
      // 保存密钥
      this.services.configService.setWeChatKey(result.key)
      logger.info('WeChat key obtained and saved')
      return { success: true, message: 'Key obtained successfully' }
    }

    return {
      success: false,
      message: result.error || 'Failed to obtain WeChat key'
    }
  }

  // TODO: 跟 chatlogService.ts 存在很多重复代码

  /**
   * 解密数据库
   */
  private async decryptDatabase(): Promise<InitializationResult> {
    this.updateStepUserAction(InitializationStep.DECRYPTING_DATABASE, 'wait_decryption')

    // 获取微信数据目录
    const dataInfoResult = await this.services.wechatDetectionService.getWeChatDataInfo()
    if (!dataInfoResult.success || !dataInfoResult.data) {
      return {
        success: false,
        message: 'Failed to detect WeChat data directory'
      }
    }

    const wechatKey = this.services.configService.getWeChatKey()
    if (!wechatKey) {
      return {
        success: false,
        message: 'WeChat key not available'
      }
    }

    const workDir = this.services.configService.getChatlogWorkDir()

    const result = await this.services.databaseService.decryptDatabase({
      sourceDir: dataInfoResult.data.dataDir,
      workDir,
      key: wechatKey,
      chatlogPath: this.services.chatlogPath
    })

    // 如果解密成功，记录当前时间戳
    if (result.success) {
      const currentTime = new Date().toISOString()
      this.services.configService.setLastDataUpdateTime(currentTime)
      logger.info(`Database decrypted successfully at ${currentTime}`)
    }

    return {
      success: result.success,
      message:
        result.message || (result.success ? 'Database decrypted successfully' : 'Decryption failed')
    }
  }

  /**
   * 启动服务
   */
  private async startService(): Promise<InitializationResult> {
    const workDir = this.services.configService.getChatlogWorkDir()

    const processConfig = {
      executable: this.services.chatlogPath,
      args: ['server', '--work-dir', workDir, '--addr', '127.0.0.1:5030']
    }

    const result = await this.services.processService.startProcess(processConfig)

    return {
      success: result.success,
      message:
        result.message ||
        (result.success ? 'Service started successfully' : 'Failed to start service')
    }
  }

  /**
   * 完成初始化
   */
  private completeInitialization(): void {
    this.state.currentStep = InitializationStep.COMPLETED
    this.state.isCompleted = true
    this.state.canExit = true
    this.state.overallProgress = 100

    this.updateStepStatus(InitializationStep.COMPLETED, InitializationStatus.SUCCESS, 100)

    logger.info('Initialization completed successfully')
    this.emit('completed')
  }

  /**
   * 处理步骤错误
   */
  private handleStepError(step: InitializationStep, error: Error): void {
    logger.error(`Step ${step} failed:`, error)
    this.updateStepStatus(step, InitializationStatus.ERROR, 0, error.message)
    this.emit('error', { step, error: error.message })
  }

  /**
   * 更新步骤状态
   */
  private updateStepStatus(
    step: InitializationStep,
    status: InitializationStatus,
    progress: number = 0,
    error?: string
  ): void {
    this.state.currentStep = step
    this.state.steps[step].status = status
    this.state.steps[step].progress = progress

    if (error) {
      this.state.steps[step].error = error
    }

    this.calculateOverallProgress()
    this.emit('stateChanged', this.state)
  }

  /**
   * 更新步骤进度
   */
  private updateStepProgress(step: InitializationStep, progress: number): void {
    this.state.steps[step].progress = progress
    this.calculateOverallProgress()
    this.emit('stateChanged', this.state)
  }

  /**
   * 更新步骤用户操作提示
   */
  private updateStepUserAction(step: InitializationStep, actionKey: string): void {
    this.state.steps[step].userAction = USER_ACTION_MESSAGES[actionKey]
    this.emit('stateChanged', this.state)
  }

  /**
   * 计算总进度
   */
  private calculateOverallProgress(): void {
    let totalWeight = 0
    let completedWeight = 0

    Object.values(InitializationStep).forEach((step) => {
      if (step === InitializationStep.COMPLETED) return

      const config = INITIALIZATION_STEPS_CONFIG[step]
      const stepInfo = this.state.steps[step]

      totalWeight += config.weight

      if (stepInfo.status === InitializationStatus.SUCCESS) {
        completedWeight += config.weight
      } else if (stepInfo.status === InitializationStatus.IN_PROGRESS) {
        completedWeight += (config.weight * stepInfo.progress) / 100
      }
    })

    this.state.overallProgress =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
  }

  // 公共方法
  getState(): InitializationState {
    return { ...this.state }
  }

  async retryCurrentStep(): Promise<void> {
    if (!this.isRunning) {
      await this.executeStep(this.state.currentStep)
    }
  }

  /**
   * 检查是否存在解密后的数据
   */
  async hasDecryptedData(): Promise<boolean> {
    try {
      const workDir = this.services.configService.getChatlogWorkDir()

      if (!workDir) {
        return false
      }

      // 检查工作目录下是否存在解密后的数据库文件
      const result = await this.services.databaseService.checkDecryptedData(workDir)

      return result
    } catch (error) {
      logger.error('💥 [hasDecryptedData] Failed to check decrypted data:', error)
      return false
    }
  }
}
