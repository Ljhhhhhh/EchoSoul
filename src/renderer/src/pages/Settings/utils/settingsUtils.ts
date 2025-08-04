import { AiConfig, ProviderTemplate } from '../types'

/**
 * 验证 AI 配置是否有效
 */
export const validateAiConfig = (config: Partial<AiConfig>): boolean => {
  return !!(config.name?.trim() && config.provider && config.apiKey?.trim())
}

/**
 * 生成唯一的配置 ID
 */
export const generateConfigId = (): string => {
  return Date.now().toString()
}

/**
 * 根据提供商模板创建默认配置
 */
export const createDefaultConfig = (
  name: string,
  provider: string,
  template: ProviderTemplate,
  apiKey: string,
  customModel?: string,
  customBaseUrl?: string
): AiConfig => {
  return {
    id: generateConfigId(),
    name,
    provider,
    apiKey,
    model: customModel || template.defaultModel,
    baseUrl: customBaseUrl || template.baseUrl,
    enabled: true
  }
}

/**
 * 检查配置名称是否已存在
 */
export const isConfigNameExists = (name: string, configs: AiConfig[]): boolean => {
  return configs.some(config => config.name.toLowerCase() === name.toLowerCase())
}

/**
 * 获取启用的配置列表
 */
export const getEnabledConfigs = (configs: AiConfig[]): AiConfig[] => {
  return configs.filter(config => config.enabled)
}

/**
 * 根据 ID 查找配置
 */
export const findConfigById = (id: string, configs: AiConfig[]): AiConfig | undefined => {
  return configs.find(config => config.id === id)
}
