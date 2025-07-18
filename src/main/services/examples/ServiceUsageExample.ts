/**
 * 重构后的服务使用示例
 * 展示如何使用新的服务架构来替代原有的ChatlogService
 */

import { createServiceContainer, getServiceFactory, ServiceContainer } from '../ServiceFactory'
import { createLogger } from '../../utils/logger'

const logger = createLogger('ServiceUsageExample')

export class ServiceUsageExample {
  private services: ServiceContainer

  constructor() {
    // 使用服务工厂创建所有服务
    this.services = createServiceContainer({
      enableAutoRestart: true,
      logLevel: 'info'
    })

    this.setupEventListeners()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听微信状态变化
    this.services.wechatDetectionService.on('statusChanged', (isRunning: boolean) => {
      logger.info(`WeChat status changed: ${isRunning ? 'running' : 'stopped'}`)
    })

    // 监听数据目录检测
    this.services.wechatDetectionService.on('dataDirectoryDetected', (dataInfo) => {
      logger.info(`WeChat data directory detected: ${dataInfo.dataDir}`)
    })

    // 监听密钥获取进度
    this.services.keyService.on('progress', (progress: any) => {
      logger.info(`Key extraction progress: ${progress.step} - ${progress.message}`)
    })

    // 监听数据库解密进度
    this.services.databaseService.on('progress', (progress: any) => {
      logger.info(
        `WeChat database decryption progress: ${progress.progress}% - ${progress.message}`
      )
    })

    // 监听进程状态变化
    this.services.processService.on('statusChanged', (statusInfo) => {
      logger.info(`Process status changed: ${statusInfo.oldStatus} -> ${statusInfo.newStatus}`)
    })

    // 监听 API 服务状态变化
    this.services.apiService.on('statusChanged', (isRunning: boolean) => {
      logger.info(`Chatlog API service status: ${isRunning ? 'running' : 'stopped'}`)
    })

    // 监听 API 服务错误
    this.services.apiService.on('error', (errorInfo) => {
      logger.error(`API service error in ${errorInfo.operation}: ${errorInfo.error}`)
    })

    // 监听初始化完成
    this.services.initializationOrchestrator.on('completed', () => {
      logger.info('Initialization completed successfully')
    })

    // 监听初始化错误
    this.services.initializationOrchestrator.on('error', (errorInfo) => {
      logger.error(`Initialization error in step ${errorInfo.step}: ${errorInfo.error}`)
    })
  }

  /**
   * 示例1: 检测微信状态和进程信息
   */
  async detectWeChatStatus(): Promise<void> {
    logger.info('=== 检测微信状态示例 ===')

    // 检查微信是否运行
    const isRunning = await this.services.wechatDetectionService.isWeChatRunning()
    logger.info(`WeChat is ${isRunning ? 'running' : 'not running'}`)

    if (isRunning) {
      // 获取微信进程信息
      const processResult = await this.services.wechatDetectionService.getWeChatProcesses()
      if (processResult.success && processResult.data) {
        logger.info(`Found ${processResult.data.length} WeChat processes:`)
        processResult.data.forEach((proc) => {
          logger.info(`  - PID: ${proc.pid}, Name: ${proc.name}, Version: ${proc.version}`)
        })
      }

      // 获取微信数据目录信息
      const dataResult = await this.services.wechatDetectionService.getWeChatDataInfo()
      if (dataResult.success && dataResult.data) {
        logger.info(`WeChat data directory: ${dataResult.data.dataDir}`)
        logger.info(`Account name: ${dataResult.data.accountName}`)
        logger.info(`Version: ${dataResult.data.version}`)
        logger.info(`Status: ${dataResult.data.status}`)
      }
    }
  }

  /**
   * 示例2: 服务健康检查
   */
  async checkServicesHealth(): Promise<void> {
    logger.info('=== 服务健康检查示例 ===')

    const factory = getServiceFactory()
    const healthStatus = await factory.checkServicesHealth()

    logger.info(`Overall health: ${healthStatus.overall}`)
    logger.info('Service status:')
    logger.info(`  - WeChat: ${healthStatus.services.wechat ? 'healthy' : 'unhealthy'}`)
    logger.info(`  - Database: ${healthStatus.services.database ? 'healthy' : 'unhealthy'}`)
    logger.info(`  - Process: ${healthStatus.services.process ? 'healthy' : 'unhealthy'}`)
    logger.info(`  - API: ${healthStatus.services.api ? 'healthy' : 'unhealthy'}`)

    logger.info('Details:')
    healthStatus.details.forEach((detail) => {
      logger.info(`  - ${detail}`)
    })
  }

  /**
   * 示例3: 获取微信密钥
   */
  async extractWeChatKey(): Promise<void> {
    logger.info('=== 微信密钥获取示例 ===')

    // 检查前置条件
    const prerequisites = await this.services.keyService.getPrerequisites()
    logger.info(`Prerequisites check:`)
    logger.info(`  - WeChat running: ${prerequisites.wechatRunning}`)
    logger.info(`  - Has permissions: ${prerequisites.hasPermissions}`)
    logger.info(`  - Chatlog available: ${prerequisites.chatlogAvailable}`)

    if (
      !prerequisites.wechatRunning ||
      !prerequisites.hasPermissions ||
      !prerequisites.chatlogAvailable
    ) {
      logger.warn(`Prerequisites not met: ${prerequisites.message}`)
      return
    }

    // 检查是否已有密钥
    const existingKey = this.services.configService.getWeChatKey()
    if (existingKey) {
      logger.info('Using existing WeChat key')
      const isValid = this.services.keyService.validateKey(existingKey)
      logger.info(`Existing key validation: ${isValid ? 'valid' : 'invalid'}`)
      return
    }

    // 获取新密钥
    const result = await this.services.keyService.getWeChatKey(this.getChatlogPath())

    if (result.success && result.key) {
      logger.info('WeChat key obtained successfully')

      // 验证密钥格式
      const isValid = this.services.keyService.validateKey(result.key)
      logger.info(`Key validation: ${isValid ? 'valid' : 'invalid'}`)

      // 保存密钥
      this.services.configService.setWeChatKey(result.key)
      logger.info('Key saved to configuration')
    } else {
      logger.error(`Failed to obtain WeChat key: ${result.error}`)
    }
  }

  /**
   * 示例3: 数据库解密操作
   */
  async performDatabaseDecryption(): Promise<void> {
    logger.info('=== 数据库解密示例 ===')

    // 获取微信数据目录
    const dataResult = await this.services.wechatDetectionService.getWeChatDataInfo()
    if (!dataResult.success || !dataResult.data) {
      logger.error('Failed to get WeChat data directory')
      return
    }

    // 获取配置信息
    const wechatKey = this.services.configService.getWeChatKey()
    const workDir = this.services.configService.getChatlogWorkDir()

    if (!wechatKey) {
      logger.error('WeChat key not available')
      return
    }

    // 执行解密
    const decryptResult = await this.services.databaseService.decryptDatabase({
      sourceDir: dataResult.data.dataDir,
      workDir,
      key: wechatKey,
      chatlogPath: this.getChatlogPath()
    })

    if (decryptResult.success) {
      logger.info('Database decryption completed successfully')

      // 验证解密后的数据
      const validationResult =
        await this.services.databaseService.validateDatabaseIntegrity(workDir)
      if (validationResult.success) {
        logger.info(`Database validation passed: ${validationResult.message}`)
      } else {
        logger.warn(`Database validation failed: ${validationResult.error}`)
      }
    } else {
      logger.error(`Database decryption failed: ${decryptResult.error}`)
    }
  }

  /**
   * 示例3: API 服务操作
   */
  async testApiService(): Promise<void> {
    logger.info('=== API 服务操作示例 ===')

    // 检查服务状态
    const isRunning = await this.services.apiService.checkServiceStatus()
    logger.info(`API service status: ${isRunning ? 'running' : 'not running'}`)

    if (!isRunning) {
      logger.warn('API service is not running, skipping API tests')
      return
    }

    // 执行健康检查
    const healthCheck = await this.services.apiService.healthCheck()
    logger.info(`Health check result: ${healthCheck.status}`)
    logger.info(`Response time: ${healthCheck.details.responseTime}ms`)

    try {
      // 获取联系人列表
      logger.info('Getting contacts...')
      const contactsResult = await this.services.apiService.getContacts({ limit: 10 })
      if (contactsResult.success && contactsResult.data) {
        logger.info(`Retrieved ${contactsResult.data.length} contacts`)
        contactsResult.data.slice(0, 3).forEach((contact) => {
          logger.info(`  - ${contact.name} (${contact.type})`)
        })
      }

      // 获取会话列表
      logger.info('Getting sessions...')
      const sessionsResult = await this.services.apiService.getSessions()
      if (sessionsResult.success && sessionsResult.data) {
        logger.info(`Retrieved ${sessionsResult.data.length} sessions`)
        sessionsResult.data.slice(0, 3).forEach((session) => {
          logger.info(`  - ${session.talker} (${session.messageCount} messages)`)
        })
      }

      // 搜索联系人
      logger.info('Searching contacts...')
      const searchResult = await this.services.apiService.searchContacts('test')
      if (searchResult.success && searchResult.data) {
        logger.info(`Found ${searchResult.data.length} contacts matching "test"`)
      }

      // 获取最近的消息
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

      logger.info('Getting recent messages...')
      const messagesResult = await this.services.apiService.getMessages({
        startDate: yesterday.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        limit: 5
      })

      if (messagesResult.success && messagesResult.data) {
        logger.info(`Retrieved ${messagesResult.data.length} recent messages`)
      }
    } catch (error) {
      logger.error('API service test failed:', error)
    }
  }

  /**
   * 示例4: 进程管理操作
   */
  async manageProcess(): Promise<void> {
    logger.info('=== 进程管理示例 ===')

    const workDir = this.services.configService.getChatlogWorkDir()

    // 配置进程参数
    const processConfig = {
      executable: this.getChatlogPath(),
      args: ['server', '--work-dir', workDir, '--addr', '127.0.0.1:5030'],
      timeout: 30000
    }

    // 启动进程
    logger.info('Starting chatlog process...')
    const startResult = await this.services.processService.startProcess(processConfig)

    if (startResult.success) {
      logger.info('Process started successfully')

      // 获取进程信息
      const processInfo = this.services.processService.getProcessInfo()
      logger.info(`Process info: PID=${processInfo.pid}, Status=${processInfo.status}`)

      // 启用自动重启
      this.services.processService.enableAutoRestart(true)

      // 等待一段时间
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // 执行健康检查
      const isHealthy = await this.services.processService.healthCheck()
      logger.info(`Process health check: ${isHealthy ? 'healthy' : 'unhealthy'}`)

      // 停止进程
      logger.info('Stopping process...')
      const stopResult = await this.services.processService.stopProcess()
      if (stopResult.success) {
        logger.info('Process stopped successfully')
      }
    } else {
      logger.error(`Failed to start process: ${startResult.error}`)
    }
  }

  /**
   * 示例4: 完整的初始化流程
   */
  async runFullInitialization(): Promise<void> {
    logger.info('=== 完整初始化流程示例 ===')

    // 监听状态变化
    this.services.initializationOrchestrator.on('stateChanged', (state) => {
      logger.info(`Current step: ${state.currentStep}, Progress: ${state.overallProgress}%`)
    })

    // 开始初始化
    try {
      await this.services.initializationOrchestrator.startInitialization()
      logger.info('Initialization completed successfully')
    } catch (error) {
      logger.error('Initialization failed:', error)
    }
  }

  /**
   * 示例5: 监听微信状态变化
   */
  async startWeChatMonitoring(): Promise<void> {
    logger.info('=== 微信状态监听示例 ===')

    // 启动监听（每5秒检查一次）
    await this.services.wechatDetectionService.startMonitoring(5000)

    logger.info('WeChat monitoring started. Press Ctrl+C to stop.')

    // 在实际应用中，这里会持续运行
    // 为了示例，我们运行30秒后停止
    setTimeout(() => {
      this.services.wechatDetectionService.stopMonitoring()
      logger.info('WeChat monitoring stopped')
    }, 30000)
  }

  /**
   * 获取chatlog可执行文件路径
   */
  private getChatlogPath(): string {
    // 这里应该根据实际情况返回chatlog可执行文件的路径
    // 可以从配置服务或资源管理器获取
    const platform = process.platform
    if (platform === 'win32') {
      return 'path/to/chatlog.exe'
    } else if (platform === 'darwin') {
      return 'path/to/chatlog'
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up services...')

    // 停止监听
    this.services.wechatDetectionService.stopMonitoring()

    // 取消数据库操作
    this.services.databaseService.cancelDecryption()

    // 停止进程
    await this.services.processService.stopProcess()

    // 移除所有事件监听器
    this.services.wechatDetectionService.removeAllListeners()
    this.services.databaseService.removeAllListeners()
    this.services.processService.removeAllListeners()
    this.services.initializationOrchestrator.removeAllListeners()

    logger.info('Cleanup completed')
  }
}

// 使用示例
export async function runExamples(): Promise<void> {
  const example = new ServiceUsageExample()

  try {
    // 运行各种示例
    await example.detectWeChatStatus()
    await example.checkServicesHealth()
    await example.extractWeChatKey()
    await example.performDatabaseDecryption()
    await example.testApiService()
    await example.manageProcess()
    await example.runFullInitialization()
    await example.startWeChatMonitoring()
  } catch (error) {
    logger.error('Example execution failed:', error)
  } finally {
    await example.cleanup()
  }
}
