import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createLogger } from '../utils/logger';
import type { LLMConfig } from '@echosoul/common';

const logger = createLogger('LLMService');

export interface LLMProvider {
  name: string;
  models: string[];
  defaultModel: string;
  maxTokens: number;
  supportedFeatures: string[];
}

export const SUPPORTED_PROVIDERS: Record<string, LLMProvider> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
    defaultModel: 'gpt-3.5-turbo',
    maxTokens: 4096,
    supportedFeatures: ['chat', 'streaming', 'function_calling'],
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-haiku-20240307',
    maxTokens: 4096,
    supportedFeatures: ['chat', 'streaming'],
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-pro',
    maxTokens: 2048,
    supportedFeatures: ['chat', 'vision'],
  },
  openrouter: {
    name: 'OpenRouter',
    models: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku', 'google/gemini-pro'],
    defaultModel: 'openai/gpt-3.5-turbo',
    maxTokens: 4096,
    supportedFeatures: ['chat', 'streaming'],
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
    maxTokens: 4096,
    supportedFeatures: ['chat'],
  },
};

export class LLMService {
  private llmInstances = new Map<string, BaseLanguageModel>();
  private currentConfig: LLMConfig | null = null;

  async initialize() {
    logger.info('LLMService initialized');
  }

  /**
   * 配置LLM Provider
   */
  async configureProvider(config: LLMConfig): Promise<void> {
    try {
      logger.info(`Configuring LLM provider: ${config.provider}`);
      
      // 验证配置
      this.validateConfig(config);
      
      // 创建LLM实例
      const llm = await this.createLLMInstance(config);
      
      // 测试连接
      await this.testConnection(llm);
      
      // 保存配置和实例
      this.currentConfig = config;
      this.llmInstances.set(config.provider, llm);
      
      logger.info(`LLM provider ${config.provider} configured successfully`);
    } catch (error) {
      logger.error(`Failed to configure LLM provider ${config.provider}:`, error);
      throw error;
    }
  }

  /**
   * 获取当前配置的LLM实例
   */
  getCurrentLLM(): BaseLanguageModel {
    if (!this.currentConfig) {
      throw new Error('No LLM provider configured');
    }
    
    const llm = this.llmInstances.get(this.currentConfig.provider);
    if (!llm) {
      throw new Error(`LLM instance not found for provider: ${this.currentConfig.provider}`);
    }
    
    return llm;
  }

  /**
   * 调用LLM进行分析
   */
  async analyze(systemPrompt: string, userPrompt: string, retries = 3): Promise<string> {
    const llm = this.getCurrentLLM();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`LLM analysis attempt ${attempt}/${retries}`);
        
        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ];
        
        const startTime = Date.now();
        const response = await llm.invoke(messages);
        const duration = Date.now() - startTime;
        
        logger.debug(`LLM analysis completed in ${duration}ms`);
        
        if (typeof response.content === 'string') {
          return response.content;
        } else {
          throw new Error('Invalid response format from LLM');
        }
      } catch (error) {
        logger.warn(`LLM analysis attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw new Error(`LLM analysis failed after ${retries} attempts: ${error.message}`);
        }
        
        // 指数退避
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
    
    throw new Error('Unexpected error in LLM analysis');
  }

  /**
   * 测试API Key是否有效
   */
  async testApiKey(provider: string, apiKey: string, model?: string): Promise<boolean> {
    try {
      const testConfig: LLMConfig = {
        provider: provider as any,
        apiKey,
        model: model || SUPPORTED_PROVIDERS[provider]?.defaultModel || 'gpt-3.5-turbo',
        temperature: 0.1,
        maxTokens: 100,
        timeout: 10000,
      };
      
      const llm = await this.createLLMInstance(testConfig);
      await this.testConnection(llm);
      
      return true;
    } catch (error) {
      logger.warn(`API key test failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * 获取支持的Provider列表
   */
  getSupportedProviders(): Record<string, LLMProvider> {
    return SUPPORTED_PROVIDERS;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): LLMConfig | null {
    return this.currentConfig;
  }

  private validateConfig(config: LLMConfig): void {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('API key is required');
    }
    
    if (!SUPPORTED_PROVIDERS[config.provider]) {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }
    
    const provider = SUPPORTED_PROVIDERS[config.provider];
    if (!provider.models.includes(config.model)) {
      logger.warn(`Model ${config.model} not in supported list for ${config.provider}, but will try anyway`);
    }
  }

  private async createLLMInstance(config: LLMConfig): Promise<BaseLanguageModel> {
    const commonOptions = {
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
    };

    switch (config.provider) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: config.apiKey,
          modelName: config.model,
          ...commonOptions,
        });

      case 'anthropic':
        return new ChatAnthropic({
          anthropicApiKey: config.apiKey,
          modelName: config.model,
          ...commonOptions,
        });

      case 'gemini':
        return new ChatGoogleGenerativeAI({
          apiKey: config.apiKey,
          modelName: config.model,
          ...commonOptions,
        });

      case 'openrouter':
        return new ChatOpenAI({
          openAIApiKey: config.apiKey,
          modelName: config.model,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
          },
          ...commonOptions,
        });

      case 'deepseek':
        return new ChatOpenAI({
          openAIApiKey: config.apiKey,
          modelName: config.model,
          configuration: {
            baseURL: 'https://api.deepseek.com/v1',
          },
          ...commonOptions,
        });

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  private async testConnection(llm: BaseLanguageModel): Promise<void> {
    const testMessage = new HumanMessage('Hello, this is a connection test. Please respond with "OK".');
    
    try {
      const response = await llm.invoke([testMessage]);
      logger.debug('LLM connection test successful:', response.content);
    } catch (error) {
      throw new Error(`LLM connection test failed: ${error.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): void {
    this.llmInstances.clear();
    this.currentConfig = null;
    logger.info('LLMService cleaned up');
  }
}
