/**
 * 配置管理中心
 */

export interface AppConfig {
  // API配置
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }

  // UI配置
  ui: {
    defaultPageSize: number
    maxContactsDisplay: number
    searchDebounceMs: number
    animationDuration: number
  }

  // 功能开关
  features: {
    enableErrorTracking: boolean
    enablePerformanceMonitoring: boolean
    enableDebugMode: boolean
    enableExperimentalFeatures: boolean
  }

  // 本地存储配置
  storage: {
    conditionsKey: string
    preferencesKey: string
    cacheExpiration: number
  }
}

// 默认配置
const defaultConfig: AppConfig = {
  api: {
    baseUrl: process.env.RENDERER_VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3
  },

  ui: {
    defaultPageSize: 20,
    maxContactsDisplay: 50,
    searchDebounceMs: 300,
    animationDuration: 200
  },

  features: {
    enableErrorTracking: process.env.NODE_ENV === 'production',
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableExperimentalFeatures: false
  },

  storage: {
    conditionsKey: 'generate_report_conditions',
    preferencesKey: 'user_preferences',
    cacheExpiration: 24 * 60 * 60 * 1000 // 24小时
  }
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config: AppConfig

  private constructor() {
    this.config = { ...defaultConfig }
    this.loadUserConfig()
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * 获取配置
   */
  getConfig(): AppConfig {
    return this.config
  }

  /**
   * 获取特定配置项
   */
  get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.config[key]
  }

  /**
   * 更新配置
   */
  updateConfig<T extends keyof AppConfig>(key: T, value: Partial<AppConfig[T]>): void {
    this.config[key] = { ...this.config[key], ...value }
    this.saveUserConfig()
  }

  /**
   * 加载用户自定义配置
   */
  private loadUserConfig(): void {
    try {
      const userConfig = localStorage.getItem('app_config')
      if (userConfig) {
        const parsed = JSON.parse(userConfig)
        this.config = { ...this.config, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load user config:', error)
    }
  }

  /**
   * 保存用户配置
   */
  private saveUserConfig(): void {
    try {
      localStorage.setItem('app_config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save user config:', error)
    }
  }

  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.config = { ...defaultConfig }
    localStorage.removeItem('app_config')
  }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance()
