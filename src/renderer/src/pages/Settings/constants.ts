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

export const BUILT_IN_PROMPTS: PromptTemplate[] = [
  {
    id: 'emotion-analysis',
    name: '情感分析',
    content:
      '请分析这些聊天记录中的情感变化，包括：\n1. 主要情绪类型和强度\n2. 情绪变化的时间模式\n3. 影响情绪的关键因素\n4. 情绪管理的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'personality-analysis',
    name: '人格分析',
    content:
      '基于这些聊天记录，请分析我的人格特征：\n1. 主要性格特点\n2. 沟通风格和习惯\n3. 价值观和兴趣偏好\n4. 人际交往模式\n5. 个人成长建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'relationship-analysis',
    name: '关系分析',
    content:
      '请分析我与这些联系人的关系模式：\n1. 互动频率和时间分布\n2. 话题偏好和共同兴趣\n3. 沟通风格的匹配度\n4. 关系发展趋势\n5. 改善关系的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'work-atmosphere',
    name: '工作氛围分析',
    content:
      '请分析这些工作群聊的氛围：\n1. 团队协作模式\n2. 沟通效率和质量\n3. 工作压力和情绪状态\n4. 团队凝聚力\n5. 改善工作氛围的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const DEFAULT_NEW_PROMPT = {
  name: '',
  content: ''
}
