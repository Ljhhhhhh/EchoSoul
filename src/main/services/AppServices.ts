import { ConfigService } from './ConfigService'
import { ChatlogService } from './ChatlogService'
import { AnalysisService } from './AnalysisService'
import { ReportService } from './ReportService'
import { SchedulerService } from './SchedulerService'
import { DatabaseService } from './DatabaseService'
import { createLogger } from '../utils/logger'

const logger = createLogger('AppServices')

export class AppServices {
  private _database: DatabaseService
  private _config: ConfigService
  private _chatlog: ChatlogService
  private _analysis: AnalysisService
  private _report: ReportService
  private _scheduler: SchedulerService

  constructor() {
    // 初始化服务实例，注意依赖关系
    this._database = new DatabaseService()
    this._config = new ConfigService()
    this._chatlog = new ChatlogService(this._config)
    this._analysis = new AnalysisService()
    this._report = new ReportService(this._database)
    this._scheduler = new SchedulerService(this._chatlog, this._report)
  }

  async initialize() {
    try {
      logger.info('Initializing application services...')

      // 按依赖顺序初始化服务
      await this._database.initialize()
      await this._config.initialize()
      await this._chatlog.initialize()
      await this._analysis.initialize()
      await this._report.initialize()
      await this._scheduler.initialize()

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
      await this._scheduler.cleanup()
      await this._report.cleanup()
      await this._analysis.cleanup()
      await this._chatlog.cleanup()
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

  get analysis() {
    return this._analysis
  }

  get report() {
    return this._report
  }

  get scheduler() {
    return this._scheduler
  }
}
