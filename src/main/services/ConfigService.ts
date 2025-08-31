import Store from 'electron-store'
import { createLogger } from '../utils/logger'
import type { UserSettings } from '@types'
import * as path from 'path'
import * as os from 'os'
import { app } from 'electron'

const logger = createLogger('ConfigService')

// 项目配置接口
export interface ProjectConfig {
  // 微信相关配置
  wechat: {
    key?: string
    dataDir?: string
  }
  // 聊天日志服务配置
  chatlog: {
    workDir?: string
    baseUrl: string
  }
  // 初始化配置
  initialization: {
    autoStartService: boolean
  }
}

export class ConfigService {
  private userStore: Store<UserSettings>
  private projectStore: Store<ProjectConfig>

  /**
   * 获取应用根目录
   * 开发模式：项目根目录
   * 生产模式：可执行文件所在目录的父目录
   */
  private getAppRootDir(): string {
    if (app.isPackaged) {
      // 生产模式：获取可执行文件所在目录的父目录
      // 这样在 Windows 和 Mac 上都能得到应用的安装目录
      return path.dirname(path.dirname(app.getPath('exe')))
    } else {
      // 开发模式：使用项目根目录
      return process.cwd()
    }
  }

  private defaultUserSettings: UserSettings = {
    llmProvider: 'openrouter',
    aiServices: [],
    preferences: {
      autoRetry: true,
      enableUsageTracking: true,
      enableHealthChecks: true,
      healthCheckInterval: 300000 // 5分钟
    }
  }

  private defaultProjectConfig: ProjectConfig = {
    wechat: {},
    chatlog: {
      baseUrl: 'http://127.0.0.1:5030'
      // workDir 将在 getChatlogWorkDir() 中动态计算
    },
    initialization: {
      autoStartService: true
    }
  }

  constructor() {
    // 初始化用户设置存储
    this.userStore = new Store<UserSettings>({
      name: 'echosoul-config',
      defaults: this.defaultUserSettings
    })

    // 初始化项目配置存储
    this.projectStore = new Store<ProjectConfig>({
      name: 'project-config',
      defaults: this.defaultProjectConfig
    })
  }

  async initialize() {
    logger.info('ConfigService initialized')
  }

  // === 用户设置相关方法 ===

  async get(): Promise<UserSettings> {
    return this.userStore.store
  }

  async set(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.get()
    const updated = { ...current, ...settings }
    this.userStore.store = updated
    logger.info('User settings updated')
  }

  async cleanup() {
    logger.info('ConfigService cleaned up')
  }

  // === 微信配置相关方法 ===

  /**
   * 获取微信密钥
   */
  getWeChatKey(): string | undefined {
    return this.projectStore.get('wechat.key')
  }

  /**
   * 设置微信密钥
   */
  setWeChatKey(key: string): void {
    this.projectStore.set('wechat.key', key)
    logger.info('WeChat key updated')
  }

  /**
   * 获取微信数据目录
   */
  getWeChatDataDir(): string | undefined {
    return this.projectStore.get('wechat.dataDir')
  }

  /**
   * 设置微信数据目录
   */
  setWeChatDataDir(dataDir: string): void {
    this.projectStore.set('wechat.dataDir', dataDir)
    logger.info(`WeChat data directory set to: ${dataDir}`)
  }

  // === 聊天日志配置相关方法 ===

  /**
   * 获取聊天日志工作目录
   * 使用应用根目录下的 data/chatlog_data 目录
   */
  getChatlogWorkDir(): string {
    const defaultWorkDir = path.join(this.getAppRootDir(), 'data', 'chatlog_data')
    return this.projectStore.get('chatlog.workDir', defaultWorkDir)
  }

  /**
   * 设置聊天日志工作目录
   */
  setChatlogWorkDir(workDir: string): void {
    this.projectStore.set('chatlog.workDir', workDir)
    logger.info(`Chatlog work directory set to: ${workDir}`)
  }

  /**
   * 获取聊天日志服务基础URL
   */
  getChatlogBaseUrl(): string {
    return this.projectStore.get('chatlog.baseUrl', 'http://127.0.0.1:5030')
  }

  /**
   * 设置聊天日志服务基础URL
   */
  setChatlogBaseUrl(baseUrl: string): void {
    this.projectStore.set('chatlog.baseUrl', baseUrl)
    logger.info(`Chatlog base URL set to: ${baseUrl}`)
  }

  // === 初始化配置相关方法 ===

  /**
   * 获取自动启动服务配置
   */
  getAutoStartService(): boolean {
    return this.projectStore.get('initialization.autoStartService', true)
  }

  /**
   * 设置自动启动服务配置
   */
  setAutoStartService(autoStart: boolean): void {
    this.projectStore.set('initialization.autoStartService', autoStart)
    logger.info(`Auto start service set to: ${autoStart}`)
  }

  // === 数据更新时间相关方法 ===

  /**
   * 获取上次数据更新时间
   */
  getLastDataUpdateTime(): string | undefined {
    return this.projectStore.get('lastDataUpdateTime')
  }

  /**
   * 设置上次数据更新时间
   */
  setLastDataUpdateTime(timestamp: string): void {
    this.projectStore.set('lastDataUpdateTime', timestamp)
    logger.info(`Last data update time set to: ${timestamp}`)
  }

  // === 项目配置通用方法 ===

  /**
   * 获取完整项目配置
   */
  getProjectConfig(): ProjectConfig {
    return this.projectStore.store
  }

  /**
   * 清空项目配置
   */
  clearProjectConfig(): void {
    this.projectStore.clear()
    logger.info('Project configuration cleared')
  }

  /**
   * 重置项目配置为默认值
   */
  resetProjectConfigToDefaults(): void {
    this.projectStore.store = this.defaultProjectConfig
    logger.info('Project configuration reset to defaults')
  }
}
