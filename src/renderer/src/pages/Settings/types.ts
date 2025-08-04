export interface AiConfig {
  id: string
  name: string
  provider: string
  apiKey: string
  model: string
  baseUrl: string
  enabled: boolean
}

export interface NewAiConfig {
  name: string
  provider: string
  apiKey: string
  model: string
  baseUrl: string
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
  aiConfigs: AiConfig[]
  notifications: boolean
  autoBackup: boolean
  theme: string
  promptTemplates: PromptTemplate[]
}

export type ConnectionTestType = 'chatlog' | 'ai'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'emotion' | 'personality' | 'relationship' | 'work' | 'custom'
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

export interface NewPromptTemplate {
  name: string
  description: string
  content: string
  category: 'emotion' | 'personality' | 'relationship' | 'work' | 'custom'
}

export interface PromptCategory {
  value: string
  label: string
  description: string
}

export type TabValue = 'environment' | 'ai' | 'privacy' | 'general' | 'prompts'
