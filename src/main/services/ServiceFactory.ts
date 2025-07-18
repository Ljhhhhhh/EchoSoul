import { createLogger } from '../utils/logger'
import { ConfigService } from './ConfigService'
import { getWeChatDetectionService, getWeChatKeyService, getWeChatDatabaseService } from './wechat'
import { ProcessService } from './process/ProcessService'
import { getChatlogApiService } from './api'
import { InitializationOrchestrator, ServiceDependencies } from './InitializationOrchestrator'
import { getChatlogProgramPath } from '../utils/resourceManager'

const logger = createLogger('ServiceFactory')

// 服务容器接口
export interface ServiceContainer {
  configService: ConfigService
  wechatDetectionService: ReturnType<typeof getWeChatDetectionService>
  databaseService: ReturnType<typeof getWeChatDatabaseService>
  processService: ProcessService
  keyService: ReturnType<typeof getWeChatKeyService>
  apiService: ReturnType<typeof getChatlogApiService>
  initializationOrchestrator: InitializationOrchestrator
}

// 服务工厂配置
export interface ServiceFactoryConfig {
  chatlogPath?: string
  apiBaseUrl?: string
  enableAutoRestart?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * 服务工厂类
 * 负责创建和管理所有服务实例，处理依赖注入
 */
export class ServiceFactory {
  private static instance: ServiceFactory | null = null
  private services: ServiceContainer | null = null
  private config: Required<ServiceFactoryConfig>

  private constructor(config: ServiceFactoryConfig = {}) {
    this.config = {
      chatlogPath: getChatlogProgramPath(),
      apiBaseUrl: config.apiBaseUrl || 'http://127.0.0.1:5030',
      enableAutoRestart: config.enableAutoRestart ?? true,
      logLevel: config.logLevel || 'info'
    }

    logger.info('ServiceFactory initialized with config:', this.config)
  }

  /**
   * 获取服务工厂单例实例
   */
  static getInstance(config?: ServiceFactoryConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config)
    }
    return ServiceFactory.instance
  }

  /**
   * 创建所有服务实例
   */
  createServices(): ServiceContainer {
    if (this.services) {
      logger.debug('Returning existing service container')
      return this.services
    }

    logger.info('Creating service container...')

    try {
      // 1. 创建基础服务（无依赖）
      const configService = new ConfigService()
      const wechatDetectionService = getWeChatDetectionService()
      const databaseService = getWeChatDatabaseService()
      const processService = new ProcessService()
      const keyService = getWeChatKeyService()
      const apiService = getChatlogApiService({
        baseUrl: this.config.apiBaseUrl
      })

      // 2. 配置服务
      this.configureServices({
        configService,
        wechatDetectionService,
        databaseService,
        processService,
        keyService,
        apiService
      })

      // 3. 创建编排器（依赖其他服务）
      const serviceDependencies: ServiceDependencies = {
        configService,
        wechatDetectionService,
        databaseService,
        processService,
        keyService,
        apiService,
        chatlogPath: this.config.chatlogPath
      }

      const initializationOrchestrator = new InitializationOrchestrator(serviceDependencies)

      // 4. 组装服务容器
      this.services = {
        configService,
        wechatDetectionService,
        databaseService,
        processService,
        keyService,
        apiService,
        initializationOrchestrator
      }

      // 5. 设置服务间的交互
      this.setupServiceInteractions(this.services)

      logger.info('Service container created successfully')
      return this.services
    } catch (error) {
      logger.error('Failed to create service container:', error)
      throw new Error(
        `Service creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * 配置各个服务
   */
  private configureServices(services: Omit<ServiceContainer, 'initializationOrchestrator'>): void {
    // 配置进程服务
    if (this.config.enableAutoRestart) {
      services.processService.enableAutoRestart(true)
    }

    // 配置 API 服务
    services.apiService.updateServiceUrl(this.config.apiBaseUrl)

    logger.debug('Services configured')
  }

  /**
   * 设置服务间的交互和事件监听
   */
  private setupServiceInteractions(services: ServiceContainer): void {
    // 微信检测服务 -> API 服务
    services.wechatDetectionService.on('statusChanged', (isRunning: boolean) => {
      if (!isRunning) {
        logger.warn('WeChat stopped, API service may become unavailable')
      }
    })

    // 进程服务 -> API 服务
    services.processService.on('statusChanged', (statusInfo) => {
      if (statusInfo.newStatus === 'running') {
        // 进程启动后，等待一段时间再检查 API 服务
        setTimeout(async () => {
          const isApiRunning = await services.apiService.checkServiceStatus()
          logger.info(
            `API service status after process start: ${isApiRunning ? 'running' : 'not running'}`
          )
        }, 2000)
      }
    })

    // 数据库服务 -> 配置服务
    services.databaseService.on('progress', (progress: any) => {
      logger.debug(`Database operation progress: ${progress.progress}%`)
    })

    // 密钥服务 -> 配置服务
    services.keyService.on('progress', (progress: any) => {
      logger.debug(`Key extraction progress: ${progress.step}`)
    })

    // API 服务错误处理
    services.apiService.on('error', (errorInfo) => {
      logger.error(`API service error in ${errorInfo.operation}: ${errorInfo.error}`)
    })

    logger.debug('Service interactions configured')
  }

  /**
   * 获取服务容器
   */
  getServices(): ServiceContainer {
    if (!this.services) {
      return this.createServices()
    }
    return this.services
  }

  /**
   * 获取特定服务
   */
  getService<K extends keyof ServiceContainer>(serviceName: K): ServiceContainer[K] {
    const services = this.getServices()
    return services[serviceName]
  }

  /**
   * 检查所有服务的健康状态
   */
  async checkServicesHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      wechat: boolean
      database: boolean
      process: boolean
      api: boolean
    }
    details: string[]
  }> {
    const services = this.getServices()
    const details: string[] = []

    try {
      // 检查微信状态
      const wechatRunning = await services.wechatDetectionService.isWeChatRunning()
      details.push(`WeChat: ${wechatRunning ? 'running' : 'not running'}`)

      // 检查数据库服务（简单检查，实际可以更复杂）
      const databaseHealthy = true // 数据库服务本身没有运行状态
      details.push(`Database service: ${databaseHealthy ? 'healthy' : 'unhealthy'}`)

      // 检查进程状态
      const processStatus = services.processService.getStatus()
      const processHealthy = processStatus === 'running'
      details.push(`Process service: ${processStatus}`)

      // 检查 API 服务
      const apiHealth = await services.apiService.healthCheck()
      const apiHealthy = apiHealth.status === 'healthy'
      details.push(
        `API service: ${apiHealth.status} (${apiHealth.details.responseTime || 'N/A'}ms)`
      )

      const healthyCount = [wechatRunning, databaseHealthy, processHealthy, apiHealthy].filter(
        Boolean
      ).length

      let overall: 'healthy' | 'degraded' | 'unhealthy'
      if (healthyCount === 4) {
        overall = 'healthy'
      } else if (healthyCount >= 2) {
        overall = 'degraded'
      } else {
        overall = 'unhealthy'
      }

      return {
        overall,
        services: {
          wechat: wechatRunning,
          database: databaseHealthy,
          process: processHealthy,
          api: apiHealthy
        },
        details
      }
    } catch (error) {
      logger.error('Health check failed:', error)
      return {
        overall: 'unhealthy',
        services: {
          wechat: false,
          database: false,
          process: false,
          api: false
        },
        details: [`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * 启动所有服务
   */
  async startServices(): Promise<void> {
    logger.info('Starting all services...')

    const services = this.getServices()

    try {
      // 启动微信监听
      await services.wechatDetectionService.startMonitoring(5000)
      logger.info('WeChat monitoring started')

      // 其他服务会根据需要自动启动
      logger.info('All services started successfully')
    } catch (error) {
      logger.error('Failed to start services:', error)
      throw error
    }
  }

  /**
   * 停止所有服务
   */
  async stopServices(): Promise<void> {
    if (!this.services) {
      return
    }

    logger.info('Stopping all services...')

    try {
      // 停止微信监听
      this.services.wechatDetectionService.stopMonitoring()

      // 停止进程
      await this.services.processService.stopProcess()

      // 取消数据库操作
      this.services.databaseService.cancelDecryption()

      // 取消密钥提取
      this.services.keyService.cancelKeyExtraction()

      // 清理 API 服务
      this.services.apiService.cleanup()

      // 清理所有事件监听器
      Object.values(this.services).forEach((service) => {
        if (service && typeof service.removeAllListeners === 'function') {
          service.removeAllListeners()
        }
      })

      logger.info('All services stopped successfully')
    } catch (error) {
      logger.error('Error stopping services:', error)
      throw error
    }
  }

  /**
   * 重置服务工厂
   */
  static reset(): void {
    if (ServiceFactory.instance) {
      ServiceFactory.instance.stopServices().catch((error) => {
        logger.error('Error during factory reset:', error)
      })
    }
    ServiceFactory.instance = null
  }

  /**
   * 获取配置
   */
  getConfig(): Required<ServiceFactoryConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ServiceFactoryConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // 如果服务已创建，更新相关配置
    if (this.services) {
      if (newConfig.apiBaseUrl) {
        this.services.apiService.updateServiceUrl(newConfig.apiBaseUrl)
      }

      if (newConfig.enableAutoRestart !== undefined) {
        this.services.processService.enableAutoRestart(newConfig.enableAutoRestart)
      }
    }

    logger.info('Service factory configuration updated:', newConfig)
  }
}

// 便捷函数
export function createServiceContainer(config?: ServiceFactoryConfig): ServiceContainer {
  const factory = ServiceFactory.getInstance(config)
  return factory.createServices()
}

export function getServiceFactory(config?: ServiceFactoryConfig): ServiceFactory {
  return ServiceFactory.getInstance(config)
}
