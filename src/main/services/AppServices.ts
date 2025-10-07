import { ConfigService } from './ConfigService'
import { ChatlogService } from './ChatlogService'
import { DatabaseService } from './DatabaseService'
import { AIServiceManager } from './AIServiceManager'
import { AIHealthCheckService } from './AIHealthCheckService'
import { PromptService } from './PromptService'
import { ReportService } from './ReportService'
import { TaskManager } from './TaskManager'
import { createLogger } from '../utils/logger'
import { BrowserWindow } from 'electron'

const logger = createLogger('AppServices')

export class AppServices {
  private _database: DatabaseService
  private _config: ConfigService
  private _chatlog: ChatlogService
  private _aiService: AIServiceManager
  private _aiHealthCheck: AIHealthCheckService
  private _prompt: PromptService
  private _taskManager: TaskManager
  private _report: ReportService
  private _mainWindow: BrowserWindow | null = null

  constructor() {
    // 初始化服务实例，注意依赖关系
    this._database = new DatabaseService()
    this._config = new ConfigService()
    this._chatlog = new ChatlogService(this._config)
    this._aiService = new AIServiceManager(this._config)
    this._aiHealthCheck = new AIHealthCheckService()
    this._prompt = new PromptService(this._database)
    this._taskManager = new TaskManager(this._database)
    this._report = new ReportService(
      this._database,
      this._chatlog,
      this._aiService,
      this._prompt,
      this._taskManager
    )
  }

  /**
   * 注册主窗口
   */
  registerMainWindow(mainWindow: BrowserWindow): void {
    this._mainWindow = mainWindow
    // 为 ReportService 设置 mainWindow
    this._report.setMainWindow(mainWindow)

    logger.info('MainWindow registered successfully')
  }

  /**
   * 获取主窗口
   */
  getMainWindow(): BrowserWindow | null {
    return this._mainWindow
  }

  async initialize() {
    try {
      logger.info('Initializing application services...')

      // 按依赖顺序初始化服务
      await this._database.initialize()
      await this._config.initialize()
      await this._aiService.initialize()
      await this._chatlog.initialize()
      await this._prompt.initialize()
      await this._taskManager.initialize()
      await this._report.initialize()

      logger.info('All services initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize services:', error)
      throw error
    }
  }

  async cleanup() {
    try {
      logger.info('Cleaning up application services...')

      // 按相反顺序清理服务
      await this._report.cleanup()
      await this._taskManager.cleanup()
      // await this._prompt.cleanup()
      await this._chatlog.cleanup()
      await this._aiHealthCheck.cleanup()
      await this._aiService.cleanup()
      await this._config.cleanup()
      await this._database.cleanup()

      logger.info('All services cleaned up successfully')
    } catch (error) {
      logger.error('Failed to cleanup services:', error)
    }
  }

  // Getter方法
  get database() {
    return this._database
  }

  get config() {
    return this._config
  }

  get chatlog() {
    return this._chatlog
  }

  get aiService() {
    return this._aiService
  }

  get aiHealthCheck() {
    return this._aiHealthCheck
  }

  get prompt() {
    return this._prompt
  }

  get taskManager() {
    return this._taskManager
  }

  get report() {
    return this._report
  }
}
