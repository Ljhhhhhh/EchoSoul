import { EventEmitter } from 'events'
import { createLogger } from '../../utils/logger'
import { ChatlogHttpClient } from '../ChatlogHttpClient'
import type { ChatMessage, Contact, ChatlogStatus } from '@types'

const logger = createLogger('ChatlogApiService')

// API 服务配置
export interface ApiServiceConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

// API 查询参数
export interface GetMessagesParams {
  startDate: string
  endDate: string
  talker?: string
  limit?: number
  offset?: number
}

export interface GetContactsParams {
  type?: 'individual' | 'group' | 'all'
  limit?: number
  offset?: number
}

// 群聊信息
export interface ChatroomInfo {
  id: string
  name: string
  memberCount: number
  members: string[]
  avatar?: string
  createTime?: number
}

// 会话信息
export interface SessionInfo {
  id: string
  talker: string
  lastMessageTime: number
  messageCount: number
  unreadCount?: number
}

// API 结果
export interface ApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API 服务接口
export interface IChatlogApiService {
  checkServiceStatus(): Promise<boolean>
  getContacts(params?: GetContactsParams): Promise<ApiResult<Contact[]>>
  getMessages(params: GetMessagesParams): Promise<ApiResult<ChatMessage[]>>
  getChatroomInfo(chatroomId: string): Promise<ApiResult<ChatroomInfo>>
  getSessions(): Promise<ApiResult<SessionInfo[]>>
  updateServiceUrl(baseUrl: string): void
}

export class ChatlogApiService extends EventEmitter implements IChatlogApiService {
  private httpClient: ChatlogHttpClient
  private config: Required<ApiServiceConfig>

  constructor(config: ApiServiceConfig = {}) {
    super()

    this.config = {
      baseUrl: config.baseUrl || 'http://127.0.0.1:5030',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000
    }

    this.httpClient = new ChatlogHttpClient(this.config.baseUrl)
    logger.info(`ChatlogApiService initialized with base URL: ${this.config.baseUrl}`)
  }

  /**
   * 检查 Chatlog 服务状态
   */
  async checkServiceStatus(): Promise<boolean> {
    try {
      const isRunning = await this.httpClient.checkServiceStatus()
      this.emit('statusChanged', isRunning)
      return isRunning
    } catch (error) {
      logger.debug('Service status check failed:', error)
      this.emit('statusChanged', false)
      return false
    }
  }

  /**
   * 获取服务状态（返回枚举值）
   */
  async getServiceStatus(): Promise<ChatlogStatus> {
    try {
      const isRunning = await this.checkServiceStatus()
      return isRunning ? 'running' : 'not-running'
    } catch (error) {
      logger.debug('Service status check failed:', error)
      return 'not-running'
    }
  }

  /**
   * 获取联系人列表
   */
  async getContacts(params?: GetContactsParams): Promise<ApiResult<Contact[]>> {
    try {
      logger.debug('Getting contacts with params:', params)

      const contacts = await this.httpClient.getContacts(params)

      this.emit('contactsRetrieved', contacts)

      return {
        success: true,
        data: contacts,
        message: `Retrieved ${contacts.length} contacts`
      }
    } catch (error) {
      logger.error('Failed to get contacts:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'getContacts', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 获取聊天消息
   */
  async getMessages(params: GetMessagesParams): Promise<ApiResult<ChatMessage[]>> {
    try {
      logger.debug('Getting messages with params:', params)

      // 验证参数
      if (!params.startDate || !params.endDate) {
        throw new Error('Start date and end date are required')
      }

      const messages = await this.httpClient.getMessages(params)

      this.emit('messagesRetrieved', { params, count: messages.length })

      return {
        success: true,
        data: messages,
        message: `Retrieved ${messages.length} messages`
      }
    } catch (error) {
      logger.error('Failed to get messages:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'getMessages', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 获取群聊信息
   */
  async getChatroomInfo(chatroomId: string): Promise<ApiResult<ChatroomInfo>> {
    try {
      logger.debug(`Getting chatroom info for: ${chatroomId}`)

      if (!chatroomId) {
        throw new Error('Chatroom ID is required')
      }

      const chatroomInfo = await this.httpClient.getChatroomInfo(chatroomId)

      if (chatroomInfo) {
        this.emit('chatroomInfoRetrieved', chatroomInfo)

        return {
          success: true,
          data: chatroomInfo,
          message: `Retrieved chatroom info for ${chatroomId}`
        }
      } else {
        return {
          success: false,
          error: `Chatroom not found: ${chatroomId}`
        }
      }
    } catch (error) {
      logger.error(`Failed to get chatroom info for ${chatroomId}:`, error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'getChatroomInfo', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<ApiResult<SessionInfo[]>> {
    try {
      logger.debug('Getting sessions')

      const sessions = await this.httpClient.getSessions()

      this.emit('sessionsRetrieved', sessions)

      return {
        success: true,
        data: sessions,
        message: `Retrieved ${sessions.length} sessions`
      }
    } catch (error) {
      logger.error('Failed to get sessions:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'getSessions', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 批量获取多个群聊信息
   */
  async getBatchChatroomInfo(chatroomIds: string[]): Promise<ApiResult<ChatroomInfo[]>> {
    try {
      logger.debug(`Getting batch chatroom info for ${chatroomIds.length} chatrooms`)

      const results = await Promise.allSettled(
        chatroomIds.map((id) => this.httpClient.getChatroomInfo(id))
      )

      const chatroomInfos: ChatroomInfo[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          chatroomInfos.push(result.value)
        } else {
          errors.push(`Failed to get info for ${chatroomIds[index]}`)
        }
      })

      this.emit('batchChatroomInfoRetrieved', {
        successful: chatroomInfos.length,
        failed: errors.length
      })

      return {
        success: true,
        data: chatroomInfos,
        message: `Retrieved ${chatroomInfos.length}/${chatroomIds.length} chatroom infos`
      }
    } catch (error) {
      logger.error('Failed to get batch chatroom info:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'getBatchChatroomInfo', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 搜索联系人
   */
  async searchContacts(
    query: string,
    type?: 'individual' | 'group'
  ): Promise<ApiResult<Contact[]>> {
    try {
      logger.debug(`Searching contacts with query: ${query}`)

      const contacts = await this.httpClient.getContacts({ type: type || 'all' })

      // 在客户端进行搜索过滤
      const filteredContacts = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.id.toLowerCase().includes(query.toLowerCase())
      )

      this.emit('contactsSearched', { query, count: filteredContacts.length })

      return {
        success: true,
        data: filteredContacts,
        message: `Found ${filteredContacts.length} contacts matching "${query}"`
      }
    } catch (error) {
      logger.error('Failed to search contacts:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { operation: 'searchContacts', error: errorMessage })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 更新服务地址
   */
  updateServiceUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl
    this.httpClient.updateBaseUrl(baseUrl)
    logger.info(`Service URL updated to: ${baseUrl}`)
    this.emit('serviceUrlUpdated', baseUrl)
  }

  /**
   * 获取当前服务地址
   */
  getServiceUrl(): string {
    return this.httpClient.getBaseUrl()
  }

  /**
   * 获取服务配置
   */
  getConfig(): Required<ApiServiceConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ApiServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }

    if (newConfig.baseUrl) {
      this.updateServiceUrl(newConfig.baseUrl)
    }

    logger.info('Service configuration updated:', newConfig)
    this.emit('configUpdated', this.config)
  }

  /**
   * 执行健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: {
      serviceRunning: boolean
      responseTime?: number
      lastCheck: number
    }
  }> {
    const startTime = Date.now()

    try {
      const isRunning = await this.checkServiceStatus()
      const responseTime = Date.now() - startTime

      return {
        status: isRunning ? 'healthy' : 'unhealthy',
        details: {
          serviceRunning: isRunning,
          responseTime,
          lastCheck: Date.now()
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          serviceRunning: false,
          lastCheck: Date.now()
        }
      }
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.removeAllListeners()
    logger.debug('ChatlogApiService cleaned up')
  }
}

// 单例服务实例
let chatlogApiService: ChatlogApiService | null = null

export function getChatlogApiService(config?: ApiServiceConfig): ChatlogApiService {
  if (!chatlogApiService) {
    chatlogApiService = new ChatlogApiService(config)
  }
  return chatlogApiService
}

// 便捷函数
export async function checkChatlogService(baseUrl?: string): Promise<boolean> {
  const service = getChatlogApiService(baseUrl ? { baseUrl } : undefined)
  return await service.checkServiceStatus()
}
