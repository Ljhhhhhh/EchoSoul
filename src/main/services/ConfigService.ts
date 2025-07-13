import Store from 'electron-store'
import { createLogger } from '../utils/logger'
import type { UserSettings } from '@types'

const logger = createLogger('ConfigService')

export class ConfigService {
  private store: Store<UserSettings>
  private defaultSettings: UserSettings = {
    llmProvider: 'openai',
    apiKeyEncrypted: '',
    cronTime: '02:00',
    reportPrefs: {
      autoGenerate: true,
      includeEmotions: true,
      includeTopics: true,
      includeSocial: true
    }
  }

  constructor() {
    this.store = new Store<UserSettings>({
      name: 'echosoul-config',
      defaults: this.defaultSettings
    })
  }

  async initialize() {
    logger.info('ConfigService initialized')
  }

  async get(): Promise<UserSettings> {
    return this.store.store
  }

  async set(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.get()
    const updated = { ...current, ...settings }
    this.store.store = updated
    logger.info('Settings updated')
  }

  async testApiKey(provider: string, apiKey: string): Promise<boolean> {
    // TODO: 实现API Key测试逻辑
    logger.info(`Testing API key for provider: ${provider}`)
    return true
  }

  async cleanup() {
    logger.info('ConfigService cleaned up')
  }
}
