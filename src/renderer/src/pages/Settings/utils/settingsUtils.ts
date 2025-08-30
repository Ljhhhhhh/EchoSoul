import { SimpleAiConfig, ProviderTemplate } from '../types'

/**
 * 验证 AI 配置是否有效
 */
export const validateAiConfig = (config: Partial<SimpleAiConfig>): boolean => {
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
): SimpleAiConfig => {
  return {
    name,
    provider,
    apiKey,
    model: customModel || template.defaultModel,
    baseUrl: customBaseUrl || template.baseUrl,
    isEnabled: true
  }
}

/**
 * 检查配置名称是否已存在
 */
export const isConfigNameExists = (name: string, configs: SimpleAiConfig[]): boolean => {
  return configs.some((config) => config.name.toLowerCase() === name.toLowerCase())
}

/**
 * 获取启用的配置列表
 */
export const getEnabledConfigs = (configs: SimpleAiConfig[]): SimpleAiConfig[] => {
  return configs.filter((config) => config.isEnabled)
}

/**
 * 根据名称查找配置
 */
export const findConfigByName = (
  name: string,
  configs: SimpleAiConfig[]
): SimpleAiConfig | undefined => {
  return configs.find((config) => config.name === name)
}
