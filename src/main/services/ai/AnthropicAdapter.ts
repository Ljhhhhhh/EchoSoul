import { BaseAIProviderAdapter } from './AIProviderAdapter'
import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { createLogger } from '../../utils/logger'
import axios from 'axios'

const logger = createLogger('AnthropicAdapter')

/**
 * Anthropic API 适配器（Messages v1）
 * 使用与 OpenAI Chat Completions 接近的接口进行抽象
 */
export class AnthropicAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'anthropic'
  readonly name = 'Anthropic'
  readonly description = 'Anthropic Claude models'
  readonly supportedModels = [
    'claude-3-5-sonnet-latest',
    'claude-3-opus-latest',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ]
  readonly defaultModel = 'claude-3-5-sonnet-latest'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = true

  private readonly defaultBaseUrl = 'https://api.anthropic.com/v1'

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
          'x-api-key': `${config.apiKey}`,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        timeout: timeoutMs,
        validateStatus: () => true
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
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AsyncIterable<any>> {
    try {
      logger.info('Sending chat request to Anthropic')

      const baseUrl = config.baseUrl || this.defaultBaseUrl
      const url = `${baseUrl}/messages`

      // 将 OpenAI 风格 messages 转为 Anthropic messages
      const anthropicMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

      const systemPrompt = messages.find((m) => m.role === 'system')?.content

      const requestBody: any = {
        model: config.model || this.defaultModel,
        max_tokens: options?.maxTokens || config.settings.maxTokens || 2000,
        temperature: options?.temperature ?? config.settings.temperature ?? 0.7,
        stream: true,
        messages: anthropicMessages
      }
      if (systemPrompt) requestBody.system = systemPrompt

      const controller = new AbortController()
      const timeoutMs = config.settings.timeout || 300000
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': `${config.apiKey}`,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
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
          'x-api-key': `${apiKey}`,
          'anthropic-version': '2023-06-01'
        }
      })
      return response.ok
    } catch (error) {
      logger.error('Anthropic API key validation failed:', error)
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
          'x-api-key': `${config.apiKey}`,
          'anthropic-version': '2023-06-01'
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
      logger.error('Failed to get Anthropic models:', error)
      return this.supportedModels.map((id) => ({ id, name: id }))
    }
  }

  private async makeTestRequest(config: AIServiceConfig): Promise<{
    model: string
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  }> {
    const baseUrl = config.baseUrl || this.defaultBaseUrl
    const url = `${baseUrl}/messages`

    const requestBody: any = {
      model: config.model || this.defaultModel,
      messages: [
        { role: 'user', content: 'Hello! This is a connection test. Please respond with "OK".' }
      ],
      max_tokens: 10,
      temperature: 0
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    let response: any
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': `${config.apiKey}`,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'User-Agent': 'EchoSoul/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      logger.info(`Response status: ${response.status}`)
    } catch (error: any) {
      clearTimeout(timeoutId)
      logger.error('Fetch request failed:', error)

      if (
        error.code === 'ETIMEDOUT' ||
        error.name === 'AbortError' ||
        error.message?.includes('fetch failed')
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
    return {
      model: data.model || config.model || this.defaultModel,
      usage: {
        promptTokens: data.usage?.input_tokens || data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.output_tokens || data.usage?.completion_tokens || 0,
        totalTokens:
          data.usage?.total_tokens ||
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }
}
