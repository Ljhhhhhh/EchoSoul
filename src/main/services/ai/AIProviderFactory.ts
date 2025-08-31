import type { AIProvider, AIServiceConfig, AIServiceTestResult } from '@types'
import { BaseAIProviderAdapter, type AIProviderAdapter } from './AIProviderAdapter'
import { OpenAIAdapter } from './OpenAIAdapter'
import { AnthropicAdapter } from './AnthropicAdapter'
import { OpenRouterAdapter } from './OpenRouterAdapter'
import { DeepSeekAdapter } from './DeepSeekAdapter'
import { SiliconFlowAdapter } from './SiliconFlowAdapter'
import { MoonshotAdapter } from './MoonshotAdapter'
import { createLogger } from '../../utils/logger'

const logger = createLogger('AIProviderFactory')

/**
 * AI 提供商适配器工厂
 * 负责创建和管理各种 AI 服务提供商的适配器实例
 */
export class AIProviderFactory {
  private static adapters = new Map<string, AIProviderAdapter>()

  /**
   * 获取指定提供商的适配器
   * @param provider 提供商标识
   * @returns 适配器实例
   */
  static getAdapter(provider: string): AIProviderAdapter {
    if (!this.adapters.has(provider)) {
      this.adapters.set(provider, this.createAdapter(provider))
    }

    return this.adapters.get(provider)!
  }

  /**
   * 获取所有可用的提供商
   * @returns 提供商列表
   */
  static getAvailableProviders(): AIProvider[] {
    return [
      'openai',
      'anthropic',
      'openrouter',
      'deepseek',
      'siliconflow',
      'moonshot',
      'gemini',
      'local'
    ]
  }

  /**
   * 获取所有适配器实例
   * @returns 适配器映射
   */
  static getAllAdapters(): Map<string, AIProviderAdapter> {
    // 确保所有适配器都已创建
    this.getAvailableProviders().forEach((provider) => {
      this.getAdapter(provider)
    })

    return new Map(this.adapters)
  }

  /**
   * 检查提供商是否受支持
   * @param provider 提供商标识
   * @returns 是否支持
   */
  static isProviderSupported(provider: AIProvider): boolean {
    return this.getAvailableProviders().includes(provider)
  }

  /**
   * 清理所有适配器
   */
  static async cleanup(): Promise<void> {
    logger.info('Cleaning up AI provider adapters...')

    const cleanupPromises = Array.from(this.adapters.values()).map((adapter) => adapter.cleanup?.())

    await Promise.allSettled(cleanupPromises)
    this.adapters.clear()

    logger.info('AI provider adapters cleaned up')
  }

  /**
   * 创建适配器实例
   * @param provider 提供商标识
   * @returns 适配器实例
   */
  private static createAdapter(provider: string): AIProviderAdapter {
    switch (provider) {
      case 'openai':
        return new OpenAIAdapter()

      case 'anthropic':
        return new AnthropicAdapter()

      case 'openrouter':
        return new OpenRouterAdapter()

      case 'deepseek':
        return new DeepSeekAdapter()

      case 'siliconflow':
        return new SiliconFlowAdapter()

      case 'moonshot':
        return new MoonshotAdapter()

      case 'gemini':
        return new GeminiAdapter()

      case 'local':
        return new LocalAdapter()

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }
}

/**
 * Gemini 适配器（占位符实现）
 */
class GeminiAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'gemini'
  readonly name = 'Google Gemini'
  readonly description = 'Google Gemini models'
  readonly supportedModels = ['gemini-pro', 'gemini-pro-vision']
  readonly defaultModel = 'gemini-pro'
  readonly requiresApiKey = true
  readonly supportsCustomBaseUrl = false

  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models?key=${apiKey}`
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }

  async testConnection(_config: AIServiceConfig): Promise<AIServiceTestResult> {
    // TODO: 实现 Gemini 连接测试
    return {
      success: false,
      error: 'Gemini adapter not fully implemented yet'
    }
  }

  async sendChatRequest(
    _config: AIServiceConfig,
    _messages: Array<{ role: string; content: string }>,
    _options?: { temperature?: number; maxTokens?: number; stream?: boolean }
  ): Promise<AsyncIterable<any>> {
    // TODO: 实现 Gemini 聊天请求
    throw new Error('Gemini adapter not fully implemented yet')
  }
}

/**
 * 本地模型适配器（占位符实现）
 */
class LocalAdapter extends BaseAIProviderAdapter {
  readonly provider: AIProvider = 'local'
  readonly name = 'Local Model'
  readonly description = 'Local AI models via Ollama or similar'
  readonly supportedModels = ['llama3', 'codellama', 'mistral']
  readonly defaultModel = 'llama3'
  readonly requiresApiKey = false
  readonly supportsCustomBaseUrl = true

  private readonly defaultBaseUrl = 'http://localhost:11434/v1'

  async validateApiKey(_apiKey: string, baseUrl?: string): Promise<boolean> {
    // 本地模型通常不需要 API 密钥，只需要检查服务是否可用
    try {
      const url = `${baseUrl || this.defaultBaseUrl}/models`
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }

  async testConnection(_config: AIServiceConfig): Promise<AIServiceTestResult> {
    // TODO: 实现本地模型连接测试
    return {
      success: false,
      error: 'Local adapter not fully implemented yet'
    }
  }

  async sendChatRequest(
    _config: AIServiceConfig,
    _messages: Array<{ role: string; content: string }>,
    _options?: { temperature?: number; maxTokens?: number; stream?: boolean }
  ): Promise<AsyncIterable<any>> {
    // TODO: 实现本地模型聊天请求
    throw new Error('Local adapter not fully implemented yet')
  }
}
