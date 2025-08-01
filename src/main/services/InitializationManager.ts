import { EventEmitter } from 'events'
import { createLogger } from '../utils/logger'
import { ConfigService } from './ConfigService'
import { createServiceContainer, ServiceContainer } from './ServiceFactory'
import { InitializationState } from '../types/initialization'

const logger = createLogger('InitializationManager')

/**
 * InitializationManager 适配器
 *
 * 这是一个适配器类，将原有的 InitializationManager API 映射到新的服务架构。
 * 保持向后兼容性，同时内部使用新的 InitializationOrchestrator。
 */
export class InitializationManager extends EventEmitter {
  private serviceContainer: ServiceContainer
  private configService: ConfigService
  private isInitialized = false

  constructor(configService: ConfigService) {
    super()
    this.configService = configService
    this.serviceContainer = createServiceContainer()

    this.setupEventForwarding()
    logger.info('InitializationManager adapter initialized')
  }

  /**
   * 开始初始化流程
   */
  async startInitialization(): Promise<void> {
    try {
      logger.info('Starting initialization process...')
      await this.serviceContainer.initializationOrchestrator.startInitialization()
    } catch (error) {
      logger.error('Failed to start initialization:', error)
      throw error
    }
  }

  /**
   * 获取当前状态
   */
  getState(): InitializationState {
    return this.serviceContainer.initializationOrchestrator.getState()
  }

  /**
   * 重试当前步骤
   */
  async retryCurrentStep(): Promise<void> {
    try {
      await this.serviceContainer.initializationOrchestrator.retryCurrentStep()
    } catch (error) {
      logger.error('Failed to retry current step:', error)
      throw error
    }
  }

  /**
   * 从指定步骤重试
   * 这是一个新实现的方法，原 InitializationOrchestrator 中没有
   */
  async retryFromStep(step: string): Promise<void> {
    try {
      logger.info(`Retrying from step: ${step}`)

      // 重新开始初始化
      await this.startInitialization()
    } catch (error) {
      logger.error('Failed to retry from step:', error)
      throw error
    }
  }

  /**
   * 设置工作目录
   */
  setWorkDir(workDir: string): void {
    try {
      this.serviceContainer.initializationOrchestrator.setWorkDir(workDir)
    } catch (error) {
      logger.error('Failed to set work directory:', error)
      throw error
    }
  }

  /**
   * 获取配置信息
   * 这是一个新实现的方法，返回当前的配置状态
   */
  getConfig(): any {
    try {
      return {
        wechatKey: this.configService.getWeChatKey(),
        workDir: this.configService.getChatlogWorkDir(),
        baseUrl: this.configService.getChatlogBaseUrl(),
        initialized: this.isInitialized,
        state: this.getState()
      }
    } catch (error) {
      logger.error('Failed to get config:', error)
      return {}
    }
  }

  /**
   * 清理配置
   * 这是一个新实现的方法，清理所有配置和状态
   */
  clearConfig(): void {
    try {
      logger.info('Clearing configuration...')

      // 清理配置服务中的数据
      this.configService.setWeChatKey('')
      this.configService.setChatlogWorkDir('')

      // 重置初始化状态
      this.isInitialized = false

      // 发射配置清理事件
      this.emit('configCleared')

      logger.info('Configuration cleared successfully')
    } catch (error) {
      logger.error('Failed to clear config:', error)
      throw error
    }
  }

  /**
   * 获取诊断信息
   */
  async getDiagnostics(): Promise<any> {
    try {
      const state = this.getState()
      const config = this.getConfig()

      // 获取各服务的状态
      const wechatStatus = await this.serviceContainer.wechatDetectionService.isWeChatRunning()
      const processStatus = this.serviceContainer.processService.getStatus()
      const apiStatus = await this.serviceContainer.apiService.checkServiceStatus()

      return {
        state,
        config,
        services: {
          wechat: wechatStatus,
          process: processStatus,
          api: apiStatus
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get diagnostics:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 停止初始化流程
   */
  async stopInitialization(): Promise<void> {
    try {
      logger.info('Stopping initialization process...')

      // 停止相关服务
      await this.serviceContainer.processService.stopProcess()

      // 清理资源
      this.cleanup()

      logger.info('Initialization stopped successfully')
    } catch (error) {
      logger.error('Failed to stop initialization:', error)
      throw error
    }
  }

  /**
   * 设置事件转发
   */
  private setupEventForwarding(): void {
    // 转发 InitializationOrchestrator 的事件，保持原有格式
    this.serviceContainer.initializationOrchestrator.on('stateChanged', (state) => {
      this.emit('stateChanged', this.convertStateFormat(state))
    })

    this.serviceContainer.initializationOrchestrator.on('completed', () => {
      this.isInitialized = true
      this.emit('completed')
    })

    this.serviceContainer.initializationOrchestrator.on('error', (error) => {
      this.emit('error', error)
    })

    // 转发其他可能的事件
    this.serviceContainer.initializationOrchestrator.on('stepProgress', (progress) => {
      this.emit('stepProgress', progress)
    })
  }

  /**
   * 转换状态格式以保持兼容性
   */
  private convertStateFormat(state: any): any {
    // 如果需要转换状态格式，在这里实现
    // 目前保持原格式
    return state
  }

  /**
   * 检查是否存在解密后的数据
   */
  async hasDecryptedData(): Promise<boolean> {
    try {
      return await this.serviceContainer.initializationOrchestrator.hasDecryptedData()
    } catch (error) {
      logger.error('Failed to check decrypted data:', error)
      return false
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    try {
      this.removeAllListeners()
      logger.info('InitializationManager adapter cleaned up')
    } catch (error) {
      logger.error('Error during cleanup:', error)
    }
  }
}
