import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'

const logger = createLogger('MoonshotAdapter')

/**
 * 月之暗面 Moonshot API 适配器
 * Moonshot 是由月之暗面开发的大语言模型 Kimi，使用 OpenAI 兼容的 API 格式
 * 参考文档：https://platform.moonshot.cn/docs/introduction
 */
export class MoonshotAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'moonshot'
  readonly name = 'Moonshot'
  readonly description = 'Moonshot Kimi models with long context capabilities'
  readonly supportedModels = [
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k',
    'moonshot-v1-auto'
  ]
  readonly defaultModel = 'moonshot-v1-8k'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = true

  private readonly defaultBaseUrl = 'https://api.moonshot.cn/v1'

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
      logger.error('Moonshot connection test failed:', error)
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
      logger.info('Sending chat request to Moonshot')

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
      logger.error('Moonshot API key validation failed:', error)
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
        .filter((model: any) => model.id.startsWith('moonshot'))
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          contextLength: model.context_length
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
    } catch (error) {
      logger.error('Failed to get Moonshot models:', error)
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
      throw new Error(`Fetch request failed: ${error.message}`)
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

  async getQuotaInfo(config: AIServiceConfig): Promise<{
    used: number
    remaining: number
    total: number
    resetDate?: string
  }> {
    try {
      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/user/balance`

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
      const balance = data.balance || 0
      const totalGranted = data.total_granted || 0

      return {
        used: totalGranted - balance,
        remaining: balance,
        total: totalGranted
      }
    } catch (error) {
      logger.error('Failed to get Moonshot quota info:', error)
      throw error
    }
  }
}
