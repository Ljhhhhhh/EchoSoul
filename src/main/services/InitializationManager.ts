import { EventEmitter } from 'events'
import Store from 'electron-store'
import { execa } from 'execa'
import { createLogger } from '../utils/logger'
import { ChatlogService } from './ChatlogService'
import {
  InitializationStep,
  InitializationStatus,
  InitializationState,
  InitializationStepInfo,
  InitializationConfig,
  InitializationResult,
  WeChatInfo,
  INITIALIZATION_STEPS_CONFIG,
  InitializationError,
  ERROR_MESSAGES,
  USER_ACTION_MESSAGES
} from '../types/initialization'
import * as path from 'path'
import * as os from 'os'

const logger = createLogger('InitializationManager')

export class InitializationManager extends EventEmitter {
  private store: Store<InitializationConfig>
  private chatlogService: ChatlogService
  private state: InitializationState
  private isRunning = false

  constructor() {
    super()

    // 初始化配置存储
    this.store = new Store<InitializationConfig>({
      name: 'initialization-config',
      defaults: {
        autoStartService: true,
        skipWeChatCheck: false
      }
    })

    this.chatlogService = new ChatlogService()
    this.state = this.createInitialState()
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): InitializationState {
    const steps: Record<InitializationStep, InitializationStepInfo> = {} as any

    // 初始化所有步骤
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
      // 初始化 ChatlogService
      await this.chatlogService.initialize()

      // 检查是否已经完成过初始化
      const savedConfig = this.store.store
      if (savedConfig.wechatKey && savedConfig.workDir) {
        logger.info('Found existing configuration, checking if service can start')

        // 尝试直接启动服务
        if (await this.tryStartService()) {
          this.completeInitialization()
          return
        }
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
   * 执行初始化步骤
   */
  private async runInitializationSteps(): Promise<void> {
    const steps = [
      InitializationStep.CHECKING_WECHAT,
      InitializationStep.GETTING_KEY,
      InitializationStep.SELECTING_WORKDIR,
      InitializationStep.DECRYPTING_DATABASE,
      InitializationStep.STARTING_SERVICE
    ]

    for (const step of steps) {
      await this.executeStep(step)

      // 如果步骤失败，停止执行
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
        case InitializationStep.SELECTING_WORKDIR:
          result = await this.selectWorkDir()
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
    if (this.store.get('skipWeChatCheck')) {
      return { success: true, message: 'Skipped WeChat check' }
    }

    const wechatInfo = await this.getWeChatInfo()

    if (!wechatInfo.isRunning) {
      this.updateStepUserAction(InitializationStep.CHECKING_WECHAT, 'start_wechat')
      return {
        success: false,
        message: ERROR_MESSAGES[InitializationError.WECHAT_NOT_RUNNING]
      }
    }

    return {
      success: true,
      message: `Found ${wechatInfo.processIds.length} WeChat process(es)`,
      data: wechatInfo
    }
  }

  /**
   * 获取微信密钥
   */
  private async getWeChatKey(): Promise<InitializationResult> {
    // 检查是否已有保存的密钥
    const savedKey = this.store.get('wechatKey')
    if (savedKey) {
      logger.info('Using saved WeChat key')
      return { success: true, message: 'Using saved key' }
    }

    // 获取新密钥
    const result = await this.chatlogService.getWechatKey()

    if (result.success && result.message) {
      // 保存密钥
      this.store.set('wechatKey', result.message)
      logger.info('WeChat key obtained and saved')
      return { success: true, message: 'Key obtained successfully' }
    }

    return {
      success: false,
      message: result.message || ERROR_MESSAGES[InitializationError.KEY_GENERATION_FAILED]
    }
  }

  /**
   * 选择工作目录
   */
  private async selectWorkDir(): Promise<InitializationResult> {
    // 检查是否已有保存的目录
    const savedWorkDir = this.store.get('workDir')
    if (savedWorkDir) {
      logger.info('Using saved work directory:', savedWorkDir)
      return { success: true, message: 'Using saved directory' }
    }

    // 提供默认目录选项
    const defaultWorkDir = path.join(os.homedir(), 'Documents', 'EchoSoul', 'chatlog_data')

    // 发送事件让前端显示目录选择对话框
    this.updateStepStatus(
      InitializationStep.SELECTING_WORKDIR,
      InitializationStatus.WAITING_USER_INPUT
    )
    this.updateStepUserAction(InitializationStep.SELECTING_WORKDIR, 'select_workdir')

    // 这里需要等待用户选择，实际实现中会通过 IPC 通信
    // 暂时使用默认目录
    const selectedDir = defaultWorkDir

    this.store.set('workDir', selectedDir)
    logger.info('Work directory selected:', selectedDir)

    return { success: true, message: 'Directory selected', data: selectedDir }
  }

  /**
   * 解密数据库
   */
  private async decryptDatabase(): Promise<InitializationResult> {
    this.updateStepUserAction(InitializationStep.DECRYPTING_DATABASE, 'wait_decryption')

    const result = await this.chatlogService.decryptDatabase()

    if (result.success) {
      return { success: true, message: 'Database decrypted successfully' }
    }

    return {
      success: false,
      message: result.message || ERROR_MESSAGES[InitializationError.DECRYPTION_FAILED]
    }
  }

  /**
   * 启动服务
   */
  private async startService(): Promise<InitializationResult> {
    const success = await this.chatlogService.startService()

    if (success) {
      return { success: true, message: 'Service started successfully' }
    }

    return {
      success: false,
      message: ERROR_MESSAGES[InitializationError.SERVICE_START_FAILED]
    }
  }

  /**
   * 尝试启动服务（用于检查现有配置）
   */
  private async tryStartService(): Promise<boolean> {
    try {
      const status = await this.chatlogService.checkStatus()
      if (status === 'running') {
        return true
      }

      return await this.chatlogService.startService()
    } catch (error) {
      logger.debug('Failed to start service with existing config:', error)
      return false
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

    // 计算总进度
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

  /**
   * 获取微信信息
   */
  private async getWeChatInfo(): Promise<WeChatInfo> {
    // 这里复用 ChatlogService 中的微信检测逻辑
    const processIds = await this.findWeChatProcesses()

    return {
      isRunning: processIds.length > 0,
      processIds
    }
  }

  /**
   * 查找微信进程
   */
  private async findWeChatProcesses(): Promise<number[]> {
    try {
      const { stdout } = await execa('pgrep', ['-f', 'WeChat|Weixin'])
      const pids = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((pid) => parseInt(pid.trim()))
        .filter((pid) => !isNaN(pid))
      return pids
    } catch (error) {
      // pgrep 没找到进程时会返回错误，这是正常的
      return []
    }
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

  async retryFromStep(step: InitializationStep): Promise<void> {
    // 重置从指定步骤开始的所有步骤状态
    const stepOrder = Object.values(InitializationStep)
    const startIndex = stepOrder.indexOf(step)

    for (let i = startIndex; i < stepOrder.length; i++) {
      const resetStep = stepOrder[i]
      if (resetStep !== InitializationStep.COMPLETED) {
        this.state.steps[resetStep].status = InitializationStatus.PENDING
        this.state.steps[resetStep].progress = 0
        this.state.steps[resetStep].error = undefined
      }
    }

    this.state.currentStep = step
    this.state.isCompleted = false
    this.state.canExit = false

    await this.runInitializationSteps()
  }

  // 配置方法
  setWorkDir(workDir: string): void {
    this.store.set('workDir', workDir)
  }

  getConfig(): InitializationConfig {
    return this.store.store
  }

  clearConfig(): void {
    this.store.clear()
  }
}
