import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'

const logger = createLogger('OpenAIAdapter')

/**
 * OpenAI API 适配器
 */
export class OpenAIAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'openai'
  readonly name = 'OpenAI'
  readonly description = 'OpenAI GPT models including GPT-4, GPT-3.5-turbo'
  readonly supportedModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ]
  readonly defaultModel = 'gpt-4o-mini'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = true

  private readonly defaultBaseUrl = 'https://api.openai.com/v1'

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
      logger.error('OpenAI connection test failed:', error)
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

  async validateApiKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = `${baseUrl || this.defaultBaseUrl}/models`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      logger.error('OpenAI API key validation failed:', error)
      return false
    }
  }

  async getAvailableModels(config: AIServiceConfig): Promise<string[]> {
    try {
      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/models`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
        .filter((model: any) => model.id.startsWith('gpt-'))
        .map((model: any) => model.id)
        .sort()
    } catch (error) {
      logger.error('Failed to get OpenAI models:', error)
      return this.supportedModels
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
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

    const requestBody: any = {
      model: config.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? config.settings.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? config.settings.maxTokens,
      stream: options?.stream ?? false
    }

    // 添加可选参数
    if (config.settings.topP !== undefined) {
      requestBody.top_p = config.settings.topP
    }
    if (config.settings.frequencyPenalty !== undefined) {
      requestBody.frequency_penalty = config.settings.frequencyPenalty
    }
    if (config.settings.presencePenalty !== undefined) {
      requestBody.presence_penalty = config.settings.presencePenalty
    }

    const response = await this.withTimeout(
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
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
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          }
        : undefined,
      model: data.model
    }
  }
}
