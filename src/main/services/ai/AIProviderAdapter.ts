import type { AIProvider, AIServiceConfig, AIServiceTestResult, AIUsageStats } from '@types'

/**
 * AI 提供商适配器接口
 * 定义所有 AI 服务提供商必须实现的标准接口
 */
export interface AIProviderAdapter {
  /**
   * 提供商标识符
   */
  readonly provider: AIProvider

  /**
   * 提供商名称
   */
  readonly name: string

  /**
   * 提供商描述
   */
  readonly description: string

  /**
   * 支持的模型列表
   */
  readonly supportedModels: string[]

  /**
   * 默认模型
   */
  readonly defaultModel: string

  /**
   * 是否需要 API 密钥
   */
  readonly requiresApiKey: boolean

  /**
   * 是否支持自定义 Base URL
   */
  readonly supportsCustomBaseUrl: boolean

  /**
   * 初始化适配器
   * @param config 服务配置
   */
  initialize(config: AIServiceConfig): Promise<void>

  /**
   * 测试连接和配置
   * @param config 服务配置
   * @returns 测试结果
   */
  testConnection(config: AIServiceConfig): Promise<AIServiceTestResult>

  /**
   * 发送聊天请求
   * @param config 服务配置
   * @param messages 消息列表
   * @param options 请求选项
   * @returns 响应结果
   */
  sendChatRequest(
    config: AIServiceConfig,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<AsyncIterable<any>>

  /**
   * 获取使用统计
   * @param config 服务配置
   * @returns 使用统计
   */
  getUsageStats?(config: AIServiceConfig): Promise<AIUsageStats>

  /**
   * 获取可用模型列表
   * @param config 服务配置
   * @returns 模型列表
   */
  getAvailableModels?(config: AIServiceConfig): Promise<
    {
      id: string
      name: string
      contextLength?: number
      pricing?: {
        prompt: number
        completion: number
      }
    }[]
  >

  /**
   * 验证 API 密钥
   * @param apiKey API 密钥
   * @param baseUrl 可选的基础 URL
   * @returns 是否有效
   */
  validateApiKey(apiKey: string, baseUrl?: string): Promise<boolean>

  /**
   * 获取配额信息
   * @param config 服务配置
   * @returns 配额信息
   */
  getQuotaInfo?(config: AIServiceConfig): Promise<{
    used: number
    remaining: number
    total: number
    resetDate?: string
  }>

  /**
   * 清理资源
   */
  cleanup?(): Promise<void>
}

/**
 * 抽象基类，提供通用功能
 */
export abstract class BaseAIProviderAdapter implements AIProviderAdapter {
  abstract readonly provider: AIProvider
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly supportedModels: string[]
  abstract readonly defaultModel: string
  abstract readonly requiresApiKey: boolean
  abstract readonly supportsCustomBaseUrl: boolean

  protected initialized = false
  protected currentConfig: AIServiceConfig | null = null

  async initialize(config: AIServiceConfig): Promise<void> {
    this.currentConfig = config
    this.initialized = true
  }

  abstract testConnection(config: AIServiceConfig): Promise<AIServiceTestResult>
  abstract sendChatRequest(
    config: AIServiceConfig,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<AsyncIterable<any>>
  abstract validateApiKey(apiKey: string, baseUrl?: string): Promise<boolean>

  /**
   * 通用的错误处理
   */
  protected handleError(error: any, context: string): never {
    const message = error?.message || error?.toString() || 'Unknown error'
    throw new Error(`${this.name} ${context}: ${message}`)
  }

  /**
   * 通用的请求超时处理
   */
  protected withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ])
  }

  /**
   * 通用的重试逻辑
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          break
        }

        // 指数退避
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  async cleanup(): Promise<void> {
    this.initialized = false
    this.currentConfig = null
  }
}
