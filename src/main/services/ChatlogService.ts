import { createLogger } from '../utils/logger'
import type { ChatMessage, Contact, ChatlogStatus } from '../../types'
import { ConfigService } from './ConfigService'
import { createServiceContainer, ServiceContainer } from './ServiceFactory'
import { getChatlogProgramPath } from '../utils/resourceManager'
import { ChatroomInfo } from './api'

const logger = createLogger('ChatlogService')

/**
 * ChatlogService 适配器
 *
 * 这是一个适配器类，将原有的 ChatlogService API 映射到新的服务架构。
 * 保持向后兼容性，同时内部使用新的微服务架构。
 */
export class ChatlogService {
  private serviceContainer: ServiceContainer
  private configService: ConfigService

  constructor(configService: ConfigService) {
    this.configService = configService
    this.serviceContainer = createServiceContainer()

    logger.info('ChatlogService adapter initialized')
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      // 初始化服务容器中的各个服务
      await this.serviceContainer.configService.initialize()
      logger.info('ChatlogService adapter initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize ChatlogService adapter:', error)
      throw error
    }
  }

  /**
   * 检查 chatlog 服务状态
   */
  async checkStatus(): Promise<ChatlogStatus> {
    try {
      const isRunning = await this.serviceContainer.apiService.checkServiceStatus()
      return isRunning ? 'running' : 'not-running'
    } catch (error) {
      logger.debug('Error checking service status:', error)
      return 'error'
    }
  }

  /**
   * 启动 chatlog 服务
   */
  async startService(): Promise<boolean> {
    try {
      const workDir = this.configService.getChatlogWorkDir()
      if (!workDir) {
        logger.error('Work directory not configured')
        return false
      }

      const processConfig = {
        executable: getChatlogProgramPath(),
        args: ['server', '--work-dir', workDir, '--addr', '127.0.0.1:5030']
      }

      const result = await this.serviceContainer.processService.startProcess(processConfig)
      return result.success
    } catch (error) {
      logger.error('Failed to start chatlog service:', error)
      return false
    }
  }

  /**
   * 停止 chatlog 服务
   */
  async stopService(): Promise<void> {
    try {
      await this.serviceContainer.processService.stopProcess()
      logger.info('Chatlog service stopped')
    } catch (error) {
      logger.error('Failed to stop chatlog service:', error)
      throw error
    }
  }

  /**
   * 获取联系人列表
   */
  async getContacts(): Promise<Contact[]> {
    try {
      const result = await this.serviceContainer.apiService.getContacts()
      return result.success ? result.data || [] : []
    } catch (error) {
      logger.error('Failed to get contacts:', error)
      return []
    }
  }

  /**
   * 获取群聊列表
   */
  async getChatroomList(): Promise<ChatroomInfo[]> {
    try {
      const result = await this.serviceContainer.apiService.getChatroomList()
      return result.success ? result.data || [] : []
    } catch (error) {
      logger.error('Failed to get chatroom list:', error)
      return []
    }
  }

  /**
   * 获取微信密钥
   */
  async getWechatKey(): Promise<{ success: boolean; message: string }> {
    try {
      const chatlogPath = getChatlogProgramPath()
      const result = await this.serviceContainer.keyService.getWeChatKey(chatlogPath)

      if (result.success && result.key) {
        // 保存密钥到配置
        this.configService.setWeChatKey(result.key)
        return {
          success: true,
          message: result.key
        }
      }

      return {
        success: false,
        message: result.error || 'Failed to get WeChat key'
      }
    } catch (error) {
      logger.error('Failed to get WeChat key:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 解密数据库
   */
  async decryptDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      // 获取必要的参数
      const wechatKey = this.configService.getWeChatKey()
      const workDir = this.configService.getChatlogWorkDir()

      if (!wechatKey) {
        return {
          success: false,
          message: 'WeChat key not available'
        }
      }

      if (!workDir) {
        return {
          success: false,
          message: 'Work directory not configured'
        }
      }

      // 获取微信数据目录
      const dataResult = await this.serviceContainer.wechatDetectionService.getWeChatDataInfo()
      if (!dataResult.success || !dataResult.data) {
        return {
          success: false,
          message: 'Failed to get WeChat data directory'
        }
      }

      // 执行解密
      const result = await this.serviceContainer.databaseService.decryptDatabase({
        sourceDir: dataResult.data.dataDir,
        workDir,
        key: wechatKey,
        chatlogPath: getChatlogProgramPath()
      })

      return {
        success: result.success,
        message: result.success
          ? 'Database decrypted successfully'
          : result.error || 'Decryption failed'
      }
    } catch (error) {
      logger.error('Failed to decrypt database:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 检查初始化状态
   */
  async checkInitialization(): Promise<{
    keyObtained: boolean
    databaseDecrypted: boolean
    canStartServer: boolean
  }> {
    try {
      // 检查密钥
      const keyObtained = !!this.configService.getWeChatKey()

      // 检查解密数据
      const workDir = this.configService.getChatlogWorkDir()
      const databaseDecrypted = workDir
        ? await this.serviceContainer.databaseService.checkDecryptedData(workDir)
        : false

      // 检查服务状态
      let isServiceRunning = false
      if (databaseDecrypted) {
        // 检查进程服务状态或API服务状态
        const processStatus = this.serviceContainer.processService.getStatus()
        const apiStatus = await this.serviceContainer.apiService.checkServiceStatus()
        isServiceRunning = processStatus === 'running' || apiStatus
      }

      return {
        keyObtained,
        databaseDecrypted,
        canStartServer: databaseDecrypted && !isServiceRunning
      }
    } catch (error) {
      logger.debug('Error checking initialization:', error)
      return {
        keyObtained: !!this.configService.getWeChatKey(),
        databaseDecrypted: false,
        canStartServer: false
      }
    }
  }

  /**
   * 获取聊天记录
   */
  async getMessages(params: {
    contactId?: string
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<ChatMessage[]> {
    try {
      // 构造符合 API 要求的参数
      const apiParams = {
        startDate: params.startDate || '2020-01-01',
        endDate: params.endDate || new Date().toISOString().split('T')[0],
        talker: params.contactId,
        limit: params.limit,
        offset: params.offset
      }

      const result = await this.serviceContainer.apiService.getMessages(apiParams)
      return result.success ? result.data || [] : []
    } catch (error) {
      logger.error('Failed to get messages:', error)
      return []
    }
  }

  /**
   * 获取 chatlog 工作目录
   */
  getChatlogWorkDir(): string {
    return this.configService.getChatlogWorkDir()
  }

  /**
   * 设置 chatlog 工作目录
   */
  setChatlogWorkDir(workDir: string): void {
    this.configService.setChatlogWorkDir(workDir)
  }

  /**
   * 获取 chatlog 基础 URL
   */
  getChatlogBaseUrl(): string {
    return this.configService.getChatlogBaseUrl()
  }

  /**
   * 设置 chatlog 基础 URL
   */
  setChatlogBaseUrl(baseUrl: string): void {
    this.configService.setChatlogBaseUrl(baseUrl)
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopService()
      logger.info('ChatlogService adapter cleaned up')
    } catch (error) {
      logger.error('Error during cleanup:', error)
    }
  }
}
