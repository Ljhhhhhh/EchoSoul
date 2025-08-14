// 导入主类型定义
import { AIServiceConfig, AIProvider } from '@types'

// 重新导出AIServiceConfig作为主要类型
export type { AIServiceConfig }

// 简化的配置接口，用于UI表单
export interface SimpleAiConfig {
  name: string
  provider: string
  apiKey: string
  model: string
  baseUrl: string
  isEnabled: boolean
}

// 从简化配置生成完整AIServiceConfig的工具函数
export function createAIServiceConfig(simple: AIServiceConfig, id?: string): AIServiceConfig {
  const now = new Date().toISOString()
  return {
    id: id || crypto.randomUUID(),
    provider: simple.provider as AIProvider,
    name: simple.name,
    description: `${simple.provider} AI服务配置`,
    apiKey: simple.apiKey,
    baseUrl: simple.baseUrl || undefined,
    model: simple.model,
    settings: {
      temperature: 0.7,
      maxTokens: undefined,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    isEnabled: true,
    isPrimary: false,
    createdAt: now,
    updatedAt: now
  }
}

// 从完整配置提取简化配置的工具函数
export function extractSimpleConfig(config: AIServiceConfig): SimpleAiConfig {
  return {
    name: config.name,
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
    baseUrl: config.baseUrl || '',
    isEnabled: config.isEnabled
  }
}

export interface ProviderTemplate {
  name: string
  defaultModel: string
  baseUrl: string
  requiresBaseUrl: boolean
}

export interface ProviderTemplates {
  [key: string]: ProviderTemplate
}

export interface SettingsState {
  chatlogWorkDir: string
  currentAiConfig: string
  aiConfigs: AIServiceConfig[]
  notifications: boolean
  autoBackup: boolean
  theme: string
  promptTemplates: PromptTemplate[]
}

export type ConnectionTestType = 'chatlog' | 'ai'

export interface PromptTemplate {
  id: string
  name: string
  content: string
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

export interface NewPromptTemplate {
  name: string
  content: string
}

export type TabValue = 'environment' | 'ai' | 'privacy' | 'general' | 'prompts'
