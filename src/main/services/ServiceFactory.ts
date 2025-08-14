import { createLogger } from '../utils/logger'
import { ConfigService } from './ConfigService'
import {
  WeChatDetectionService,
  WeChatKeyService,
  WeChatDatabaseService,
  createWeChatDetector
} from './wechat'
import { ProcessService } from './process/ProcessService'
import { ChatlogApiService } from './api/ChatlogApiService'
import { InitializationOrchestrator, ServiceDependencies } from './InitializationOrchestrator'
import { getChatlogProgramPath } from '../utils/resourceManager'

const logger = createLogger('ServiceFactory')

// 服务容器接口
export interface ServiceContainer {
  configService: ConfigService
  wechatDetectionService: WeChatDetectionService
  databaseService: WeChatDatabaseService
  processService: ProcessService
  keyService: WeChatKeyService
  apiService: ChatlogApiService
  initializationOrchestrator: InitializationOrchestrator
}

// 服务工厂配置
export interface ServiceFactoryConfig {
  chatlogPath?: string
}

// 服务工厂类
export class ServiceFactory {
  private static instance: ServiceFactory | null = null
  private serviceContainer: ServiceContainer | null = null
  private config: ServiceFactoryConfig

  private constructor(config: ServiceFactoryConfig = {}) {
    this.config = config
  }

  static getInstance(config?: ServiceFactoryConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config)
    }
    return ServiceFactory.instance
  }

  /**
   * 创建服务容器
   */
  createServiceContainer(): ServiceContainer {
    if (this.serviceContainer) {
      return this.serviceContainer
    }

    try {
      logger.info('Creating service container...')

      // 创建基础服务
      const configService = new ConfigService()
      const wechatDetector = createWeChatDetector()
      const wechatDetectionService = new WeChatDetectionService(wechatDetector)
      const databaseService = new WeChatDatabaseService()
      const processService = new ProcessService()
      const keyService = new WeChatKeyService()
      const apiService = new ChatlogApiService()

      // 获取 chatlog 程序路径
      const chatlogPath = this.config.chatlogPath || getChatlogProgramPath()

      // 创建服务依赖
      const serviceDependencies: ServiceDependencies = {
        configService,
        wechatDetectionService,
        databaseService,
        processService,
        keyService,
        apiService,
        chatlogPath
      }

      // 创建初始化编排器
      const initializationOrchestrator = new InitializationOrchestrator(serviceDependencies)

      // 创建服务容器
      this.serviceContainer = {
        configService,
        wechatDetectionService,
        databaseService,
        processService,
        keyService,
        apiService,
        initializationOrchestrator
      }

      logger.info('Service container created successfully')
      return this.serviceContainer
    } catch (error) {
      logger.error('Failed to create service container:', error)
      throw error
    }
  }

  /**
   * 获取服务容器
   */
  getServiceContainer(): ServiceContainer | null {
    return this.serviceContainer
  }

  /**
   * 清理服务容器
   */
  cleanup(): void {
    if (this.serviceContainer) {
      logger.info('Cleaning up service container...')
      // 这里可以添加清理逻辑
      this.serviceContainer = null
    }
  }
}

// 便捷函数
export function createServiceContainer(config?: ServiceFactoryConfig): ServiceContainer {
  const factory = ServiceFactory.getInstance(config)
  return factory.createServiceContainer()
}

export function getServiceFactory(config?: ServiceFactoryConfig): ServiceFactory {
  return ServiceFactory.getInstance(config)
}
