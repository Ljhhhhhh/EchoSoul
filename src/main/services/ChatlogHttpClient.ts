import { HttpClient, RequestOptions } from '../utils/HttpClient'
import { createLogger } from '../utils/logger'
import type { ChatMessage, Contact } from '@types'

const logger = createLogger('ChatlogHttpClient')

export interface ChatlogApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface GetMessagesParams {
  startDate: string
  endDate: string
  talker?: string
  limit?: number
  offset?: number
}

export interface GetContactsParams {
  type?: 'individual' | 'group' | 'all'
  keyword?: string
  format?: 'json' | 'text'

  // keyword=vip&format=json
}

export interface ChatroomInfo {
  id: string
  name: string
  memberCount: number
  members: string[]
  avatar?: string
  createTime?: number
}

export interface SessionInfo {
  id: string
  talker: string
  lastMessageTime: number
  messageCount: number
  unreadCount?: number
}

/**
 * Chatlog HTTP API 客户端
 * 封装所有与 chatlog 服务相关的 HTTP 请求
 */
export class ChatlogHttpClient {
  private httpClient: HttpClient
  private readonly defaultRetries = 3
  private readonly defaultRetryDelay = 1000

  constructor(baseUrl: string = 'http://127.0.0.1:5030') {
    this.httpClient = new HttpClient({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    logger.info(`ChatlogHttpClient initialized with base URL: ${baseUrl}`)
  }

  /**
   * 检查 Chatlog 服务状态
   */
  async checkServiceStatus(): Promise<boolean> {
    try {
      // 使用联系人 API 作为健康检查
      await this.httpClient.get('/api/v1/contact', {
        timeout: 3000,
        retries: 0 // 不重试，快速失败
      })
      return true
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        logger.debug('Chatlog service is not running on', this.httpClient.getBaseURL())
      } else {
        logger.debug('Chatlog service health check failed:', error.message)
      }
      return false
    }
  }

  /**
   * 获取联系人列表
   */
  async getContacts(params?: GetContactsParams): Promise<Contact[]> {
    try {
      const queryParams = new URLSearchParams()

      if (!params?.format) {
        queryParams.set('format', 'json')
      }

      if (params?.keyword) {
        queryParams.set('keyword', params?.keyword)
      }

      const url = `/api/v1/contact${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      logger.debug(`GET request to ${url}`)

      const data = await this.httpClient.get<{ items: any[] }>(url, {
        retries: this.defaultRetries,
        retryDelay: this.defaultRetryDelay
      })

      return data.items
    } catch (error) {
      logger.error('Failed to get contacts:', error)
      throw new Error(`获取联系人失败: ${this.getErrorMessage(error)}`)
    }
  }

  async getChatroomList(params?: GetContactsParams): Promise<ChatroomInfo[]> {
    try {
      const queryParams = new URLSearchParams()

      if (!params?.format) {
        queryParams.set('format', 'json')
      }

      if (params?.keyword) {
        queryParams.set('keyword', params?.keyword)
      }

      const url = `/api/v1/chatroom${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const data = await this.httpClient.get<{ items: any[] }>(url, {
        retries: this.defaultRetries,
        retryDelay: this.defaultRetryDelay
      })
      return data.items
    } catch (error) {
      logger.error('Failed to get chatroom list:', error)
      throw new Error(`获取群聊列表失败: ${this.getErrorMessage(error)}`)
    }
  }

  /**
   * 获取聊天消息
   */
  async getMessages(params: GetMessagesParams): Promise<ChatMessage[]> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('time', `${params.startDate}~${params.endDate}`)

      if (params.talker) {
        queryParams.set('talker', params.talker)
      }
      if (params.limit) {
        queryParams.set('limit', params.limit.toString())
      }
      if (params.offset) {
        queryParams.set('offset', params.offset.toString())
      }

      const url = `/api/v1/chatlog?${queryParams.toString()}`

      const data = await this.httpClient.get<any[]>(url, {
        retries: this.defaultRetries,
        retryDelay: this.defaultRetryDelay
      })

      return this.normalizeMessages(data)
    } catch (error) {
      logger.error('Failed to get messages:', error)
      throw new Error(`获取聊天记录失败: ${this.getErrorMessage(error)}`)
    }
  }

  /**
   * 获取群聊信息
   */
  async getChatroomInfo(chatroomId: string): Promise<ChatroomInfo | null> {
    try {
      const data = await this.httpClient.get<any>(`/api/v1/chatroom/${chatroomId}`, {
        retries: this.defaultRetries,
        retryDelay: this.defaultRetryDelay
      })

      return {
        id: data.id || data.wxid,
        name: data.name || data.nickname,
        memberCount: data.memberCount || 0,
        members: data.members || [],
        avatar: data.avatar,
        createTime: data.createTime
      }
    } catch (error) {
      logger.error(`Failed to get chatroom info for ${chatroomId}:`, error)
      return null
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<SessionInfo[]> {
    try {
      const data = await this.httpClient.get<any[]>('/api/v1/session', {
        retries: this.defaultRetries,
        retryDelay: this.defaultRetryDelay
      })

      return data.map((item) => ({
        id: item.id || `${item.talker}-${item.lastMessageTime}`,
        talker: item.talker,
        lastMessageTime: item.lastMessageTime || 0,
        messageCount: item.messageCount || 0,
        unreadCount: item.unreadCount || 0
      }))
    } catch (error) {
      logger.error('Failed to get sessions:', error)
      throw new Error(`获取会话列表失败: ${this.getErrorMessage(error)}`)
    }
  }

  /**
   * 标准化消息数据
   */
  private normalizeMessages(data: any[]): ChatMessage[] {
    return data.map((item) => ({
      id: item.id || `${item.timestamp}-${item.sender}`,
      sender: item.sender || item.from,
      recipient: item.recipient || item.to,
      timestamp: item.timestamp,
      content: item.content || item.message || '',
      type: this.normalizeMessageType(item.type),
      isGroupChat: item.isGroupChat || false,
      groupName: item.groupName
    }))
  }

  /**
   * 标准化消息类型
   */
  private normalizeMessageType(type: any): 'text' | 'image' | 'voice' | 'video' | 'file' {
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'image':
        case 'img':
          return 'image'
        case 'voice':
        case 'audio':
          return 'voice'
        case 'video':
          return 'video'
        case 'file':
          return 'file'
        default:
          return 'text'
      }
    }
    return 'text'
  }

  /**
   * 提取错误信息
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.statusText) {
      return error.response.statusText
    }
    if (error.message) {
      return error.message
    }
    return '未知错误'
  }

  /**
   * 更新服务地址
   */
  updateBaseUrl(baseUrl: string): void {
    this.httpClient.updateBaseURL(baseUrl)
    logger.info(`Chatlog service URL updated to: ${baseUrl}`)
  }

  /**
   * 获取当前服务地址
   */
  getBaseUrl(): string {
    return this.httpClient.getBaseURL()
  }

  /**
   * 通用 GET 请求方法（用于诊断等场景）
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.httpClient.get<T>(url, options)
  }
}
