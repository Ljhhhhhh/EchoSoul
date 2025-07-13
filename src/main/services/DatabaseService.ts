// import Database from 'better-sqlite3';
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { createLogger } from '../utils/logger'
import type { ReportMeta, TaskStatus } from '@types'

const logger = createLogger('DatabaseService')

// 临时内存数据库实现
export class DatabaseService {
  private reports: Map<string, ReportMeta> = new Map()
  private settings: Map<string, string> = new Map()
  private tasks: Map<string, TaskStatus> = new Map()
  private dbPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'echosoul.db')
  }

  async initialize() {
    try {
      logger.info(`Initializing in-memory database (SQLite disabled temporarily)`)

      // 确保目录存在
      const dbDir = path.dirname(this.dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      logger.info('In-memory database initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize database:', error)
      throw error
    }
  }

  // 报告相关操作
  async saveReport(report: ReportMeta): Promise<void> {
    this.reports.set(report.id, report)
  }

  async getReports(): Promise<ReportMeta[]> {
    const reports = Array.from(this.reports.values())
    return reports.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date)
      }
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  async getReportById(id: string): Promise<ReportMeta | null> {
    return this.reports.get(id) || null
  }

  // 配置相关操作
  async getSetting(key: string): Promise<string | null> {
    return this.settings.get(key) || null
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value)
  }

  // 任务状态相关操作
  async saveTaskStatus(task: TaskStatus): Promise<void> {
    this.tasks.set(task.id, task)
  }

  async getTaskStatus(id: string): Promise<TaskStatus | null> {
    return this.tasks.get(id) || null
  }

  async cleanup() {
    this.reports.clear()
    this.settings.clear()
    this.tasks.clear()
    logger.info('In-memory database cleared')
  }
}
