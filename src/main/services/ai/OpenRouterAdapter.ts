import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'
import axios from 'axios'

const logger = createLogger('OpenRouterAdapter')

/**
 * OpenRouter API 适配器
 * OpenRouter 是一个统一的 AI API 网关，支持多种模型提供商
 * 使用 OpenAI 兼容的 API 格式
 */
export class OpenRouterAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'openrouter'
  readonly name = 'OpenRouter'
  readonly description = 'OpenRouter unified API gateway for multiple AI models'
  readonly supportedModels = [
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
    'openai/gpt-4',
    'openai/gpt-3.5-turbo',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku',
    'google/gemini-pro',
    'google/gemini-pro-vision',
    'meta-llama/llama-3.1-405b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-7b-instruct',
    'mistralai/mixtral-8x7b-instruct'
  ]
  readonly defaultModel = 'openai/gpt-4o-mini'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = true

  private readonly defaultBaseUrl = 'https://openrouter.ai/api/v1'

  /**
   * 使用axios作为fetch的备用方案
   */
  private async makeRequestWithAxios(
    url: string,
    config: AIServiceConfig,
    requestBody: any,
    timeoutMs: number = 30000
  ): Promise<any> {
    logger.info(`Trying axios request to: ${url}`)

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        timeout: timeoutMs,
        validateStatus: () => true // 不要自动抛出错误
      })

      logger.info(`Axios response status: ${response.status}`)
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        json: async () => response.data
      }
    } catch (error) {
      logger.error('Axios request failed:', error)
      throw error
    }
  }

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
      logger.error('OpenRouter connection test failed:', error)
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
      logger.info('Sending chat request to OpenRouter')
      const response = await this.withTimeout(
        this.makeCompletionRequest(config, messages, options),
        config.settings.timeout || 300000
      )

      return response
    } catch (error) {
      this.handleError(error, 'chat request failed')
    }
  }

  async validateApiKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = `${baseUrl || this.defaultBaseUrl}/auth/key`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul'
        }
      })

      if (response.ok) {
        const data = await response.json()
        logger.info('OpenRouter API key validation response:', data)
        // OpenRouter 返回用户信息表示 API key 有效
        return data && (data.data || data.label)
      }

      return false
    } catch (error) {
      logger.error('OpenRouter API key validation failed:', error)
      return false
    }
  }

  async getAvailableModels(config: AIServiceConfig): Promise<
    Array<{
      id: string
      name: string
      contextLength?: number
      pricing?: { prompt: number; completion: number }
    }>
  > {
    try {
      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/models`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
        .filter((model: any) => !model.id.includes('free') && model.context_length > 0)
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          contextLength: model.context_length,
          pricing: model.pricing
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      logger.error('Failed to get OpenRouter models:', error)
      return this.supportedModels.map((id) => ({
        id,
        name: id
      }))
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
    const baseUrl = config.baseUrl || this.defaultBaseUrl
    const url = `${baseUrl}/chat/completions`

    const requestBody = {
      model: config.model || this.defaultModel,
      messages: [
        {
          role: 'user',
          content: 'Hello! This is a connection test. Please respond with "OK".'
        }
      ],
      max_tokens: 10,
      temperature: 0
    }

    logger.info(`Making test request to: ${url}`)
    logger.debug(`Request body: ${JSON.stringify(requestBody)}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      logger.info(`Response status: ${response.status}`)
    } catch (error) {
      clearTimeout(timeoutId)
      logger.error('Fetch request failed:', error)

      // 如果fetch失败，尝试使用axios作为备用方案
      if (
        error.code === 'ETIMEDOUT' ||
        error.name === 'AbortError' ||
        error.message.includes('fetch failed')
      ) {
        logger.info('Trying axios as fallback...')
        try {
          response = await this.makeRequestWithAxios(url, config, requestBody, 30000)
        } catch (axiosError) {
          logger.error('Axios fallback also failed:', axiosError)
          throw new Error(`Both fetch and axios failed. Original error: ${error.message}`)
        }
      } else {
        throw error
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    logger.info(`OpenRouter test response: ${JSON.stringify(data)}`)

    return {
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
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
    const baseUrl = config.baseUrl || this.defaultBaseUrl
    const url = `${baseUrl}/chat/completions`

    const requestBody = {
      model: config.model || this.defaultModel,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: options?.maxTokens || config.settings.maxTokens || 2000,
      temperature: options?.temperature ?? config.settings.temperature ?? 0.7,
      stream: options?.stream || false
    }

    const controller = new AbortController()
    const timeoutMs = config.settings.timeout || 300000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      logger.info(`Completion response status: ${response.status}`)
    } catch (error) {
      clearTimeout(timeoutId)
      logger.error('Completion fetch request failed:', error)

      // 如果fetch失败，尝试使用axios作为备用方案
      if (
        error.code === 'ETIMEDOUT' ||
        error.name === 'AbortError' ||
        error.message.includes('fetch failed')
      ) {
        logger.info('Trying axios as fallback for completion request...')
        try {
          response = await this.makeRequestWithAxios(url, config, requestBody, timeoutMs)
        } catch (axiosError) {
          logger.error('Axios fallback also failed for completion:', axiosError)
          throw new Error(`Both fetch and axios failed. Original error: ${error.message}`)
        }
      } else {
        throw error
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices received from OpenRouter')
    }

    const choice = data.choices[0]
    const content = choice.message?.content || choice.text || ''

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0
          }
        : undefined,
      model: data.model
    }
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels]
  }

  async getQuotaInfo(config: AIServiceConfig): Promise<{
    used: number
    remaining: number
    total: number
    resetDate?: string
  }> {
    try {
      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/auth/key`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://echosoul.app',
          'X-Title': 'EchoSoul'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const usage = data.data?.usage || {}

      return {
        used: usage.used || 0,
        remaining: usage.remaining || 0,
        total: usage.limit || 0,
        resetDate: usage.reset_date
      }
    } catch (error) {
      logger.error('Failed to get OpenRouter quota info:', error)
      throw error
    }
  }
}
