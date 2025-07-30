import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'

const logger = createLogger('AnthropicAdapter')

/**
 * Anthropic Claude API 适配器
 */
export class AnthropicAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'anthropic'
  readonly name = 'Anthropic Claude'
  readonly description = 'Anthropic Claude models including Claude-3.5 Sonnet, Claude-3 Opus'
  readonly supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ]
  readonly defaultModel = 'claude-3-5-sonnet-20241022'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = false

  private readonly baseUrl = 'https://api.anthropic.com/v1'
  private readonly apiVersion = '2023-06-01'

  async testConnection(config: AIServiceConfig): Promise<AIServiceTestResult> {
    const startTime = Date.now()

    try {
      const response = await this.withTimeout(
        this.makeTestRequest(config),
        config.settings.timeout || 30000
      )

      const responseTime = Date.now() - startTime

      return {
        success: true,
        responseTime,
        model: response.model,
        usage: response.usage
      }
    } catch (error) {
      logger.error('Anthropic connection test failed:', error)
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendChatRequest(
    config: AIServiceConfig,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<{
    content: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    model?: string
  }> {
    try {
      const response = await this.withRetry(
        () => this.makeCompletionRequest(config, messages, options),
        config.settings.retryAttempts || 3,
        config.settings.retryDelay || 1000
      )

      return response
    } catch (error) {
      this.handleError(error, 'chat request failed')
    }
  }

  async validateApiKey(apiKey: string, _baseUrl?: string): Promise<boolean> {
    try {
      // Anthropic 没有专门的验证端点，我们通过发送一个简单请求来验证
      const url = `${this.baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': this.apiVersion,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.defaultModel,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      })

      // 401 表示 API 密钥无效，其他错误可能是配额或其他问题
      return response.status !== 401
    } catch (error) {
      logger.error('Anthropic API key validation failed:', error)
      return false
    }
  }

  private async makeTestRequest(config: AIServiceConfig): Promise<{
    model: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    const url = `${this.baseUrl}/messages`

    const requestBody = {
      model: config.model || this.defaultModel,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hello! This is a connection test. Please respond with "OK".'
        }
      ]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': this.apiVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }

  private async makeCompletionRequest(
    config: AIServiceConfig,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<{
    content: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    model?: string
  }> {
    const url = `${this.baseUrl}/messages`

    // 转换消息格式 - Anthropic 不支持 system 角色在 messages 中
    const anthropicMessages = messages.filter((msg) => msg.role !== 'system')
    const systemMessage = messages.find((msg) => msg.role === 'system')?.content

    const requestBody: any = {
      model: config.model || this.defaultModel,
      max_tokens: options?.maxTokens ?? config.settings.maxTokens ?? 4096,
      messages: anthropicMessages,
      stream: options?.stream ?? false
    }

    // 添加系统消息
    if (systemMessage) {
      requestBody.system = systemMessage
    }

    // 添加可选参数
    if (options?.temperature !== undefined || config.settings.temperature !== undefined) {
      requestBody.temperature = options?.temperature ?? config.settings.temperature
    }

    if (config.settings.topP !== undefined) {
      requestBody.top_p = config.settings.topP
    }

    const response = await this.withTimeout(
      fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': this.apiVersion,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }),
      config.settings.timeout || 30000
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.content[0]?.text || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens
          }
        : undefined,
      model: data.model
    }
  }
}
