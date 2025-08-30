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
  theme: 'system',
  promptTemplates: []
}

export const THEME_OPTIONS = [
  { value: 'system', label: '跟随系统', file: null },
  { value: 'candyland', label: '糖果乐园', file: 'candyland.css' },
  { value: 'clean-slate', label: '简洁石板', file: 'clean-slate.css' },
  { value: 'cyberpunk', label: '赛博朋克', file: 'cyberpunk.css' },
  { value: 'ocean-breeze', label: '海洋微风', file: 'ocean-breeze.css' },
  { value: 'soft-pop', label: '柔和流行', file: 'soft-pop.css' },
  { value: 'starry-night', label: '星空夜晚', file: 'starry-night.css' },
  { value: 'twitter', label: 'Twitter 风格', file: 'twitter.css' }
]

export const DEFAULT_NEW_PROMPT = {
  name: '',
  content: ''
}
