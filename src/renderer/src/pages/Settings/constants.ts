import { ProviderTemplates, PromptTemplate } from './types'

export const PROVIDER_TEMPLATES: ProviderTemplates = {
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-3.5-turbo',
    baseUrl: 'https://api.openai.com/v1',
    requiresBaseUrl: false
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    defaultModel: 'claude-3-sonnet-20240229',
    baseUrl: 'https://api.anthropic.com',
    requiresBaseUrl: false
  },
  google: {
    name: 'Google (Gemini)',
    defaultModel: 'gemini-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresBaseUrl: false
  },
  deepseek: {
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com',
    requiresBaseUrl: true
  },
  openrouter: {
    name: 'OpenRouter',
    defaultModel: 'openai/gpt-3.5-turbo',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresBaseUrl: true
  },
  custom: {
    name: '自定义',
    defaultModel: '',
    baseUrl: '',
    requiresBaseUrl: true
  }
}

export const DEFAULT_NEW_CONFIG = {
  name: '',
  provider: 'openai',
  apiKey: '',
  model: '',
  baseUrl: '',
  isEnabled: true
}

export const DEFAULT_SETTINGS = {
  chatlogWorkDir: '',
  currentAiConfig: '',
  aiConfigs: [],
  notifications: true,
  autoBackup: true,
  theme: 'warm',
  promptTemplates: []
}

export const THEME_OPTIONS = [
  { value: 'warm', label: '温暖橙色（推荐）' },
  { value: 'cool', label: '清新蓝色' },
  { value: 'nature', label: '自然绿色' },
  { value: 'elegant', label: '优雅紫色' }
]

export const DEFAULT_NEW_PROMPT = {
  name: '',
  content: ''
}
