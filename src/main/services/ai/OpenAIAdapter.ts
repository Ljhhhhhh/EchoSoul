import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'

const logger = createLogger('OpenAIAdapter')

/**
 * OpenAI API 适配器（Chat Completions）
 */
export class OpenAIAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'openai'
  readonly name = 'OpenAI'
  readonly description = 'OpenAI official API for GPT models'
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4']
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
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AsyncIterable<any>> {
    try {
      logger.info('Sending chat request to OpenAI')

      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/chat/completions`

      const requestBody = {
        model: config.model || this.defaultModel,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        max_tokens: options?.maxTokens || config.settings.maxTokens || 2000,
        temperature: options?.temperature ?? config.settings.temperature ?? 0.7,
        stream: true
      }

      const controller = new AbortController()
      const timeoutMs = config.settings.timeout || 300000
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      logger.info(`Completion response status: ${response.status}`)
      return this.parseStreamResponse(response)
    } catch (error) {
      this.handleError(error, 'chat request failed')
    }
  }

  private async *parseStreamResponse(response: Response): AsyncIterable<any> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const parsed = JSON.parse(data)
              yield parsed
            } catch {
              // ignore
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
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
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return (data.data || [])
        .map((m: any) => ({ id: m.id, name: m.id }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
    } catch (error) {
      logger.error('Failed to get OpenAI models:', error)
      return this.supportedModels.map((id) => ({ id, name: id }))
    }
  }

  private async makeTestRequest(config: AIServiceConfig): Promise<{
    model: string
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  }> {
    const baseUrl = config.baseUrl || this.defaultBaseUrl
    const url = `${baseUrl}/chat/completions`

    const requestBody = {
      model: config.model || this.defaultModel,
      messages: [
        { role: 'user', content: 'Hello! This is a connection test. Please respond with "OK".' }
      ],
      max_tokens: 10,
      temperature: 0
    }

    logger.info(`Making test request to: ${url}`)
    logger.debug(`Request body: ${JSON.stringify(requestBody)}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    let response: any
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      logger.info(`Response status: ${response.status}`)
    } catch (error: any) {
      clearTimeout(timeoutId)
      throw error
    }

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
}
