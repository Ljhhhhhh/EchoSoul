// import Database from 'better-sqlite3';
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { createLogger } from '../utils/logger'
import type { ReportMeta, TaskStatus, PromptTemplate } from '@types'

const logger = createLogger('DatabaseService')

// 临时内存数据库实现
export class DatabaseService {
  private reports: Map<string, ReportMeta> = new Map()
  private settings: Map<string, string> = new Map()
  private tasks: Map<string, TaskStatus> = new Map()
  private prompts: Map<string, PromptTemplate> = new Map()
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

  // Prompt相关操作
  async savePrompt(prompt: PromptTemplate): Promise<void> {
    this.prompts.set(prompt.id, prompt)
    logger.debug(`Saved prompt: ${prompt.id}`)
  }

  async getPrompts(): Promise<PromptTemplate[]> {
    const prompts = Array.from(this.prompts.values())
    return prompts.sort((a, b) => {
      // 内置提示词排在前面
      if (a.isBuiltIn !== b.isBuiltIn) {
        return a.isBuiltIn ? -1 : 1
      }
      // 按更新时间倒序
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }

  async getPromptById(id: string): Promise<PromptTemplate | null> {
    return this.prompts.get(id) || null
  }

  async updatePrompt(id: string, updates: Partial<PromptTemplate>): Promise<boolean> {
    const existing = this.prompts.get(id)
    if (!existing) {
      return false
    }

    const updated = {
      ...existing,
      ...updates,
      id, // 确保ID不被修改
      updatedAt: new Date().toISOString()
    }

    this.prompts.set(id, updated)
    logger.debug(`Updated prompt: ${id}`)
    return true
  }

  async deletePrompt(id: string): Promise<boolean> {
    const existing = this.prompts.get(id)
    if (!existing || existing.isBuiltIn) {
      return false // 不能删除内置提示词
    }

    const deleted = this.prompts.delete(id)
    if (deleted) {
      logger.debug(`Deleted prompt: ${id}`)
    }
    return deleted
  }

  async searchPrompts(query: string): Promise<PromptTemplate[]> {
    const allPrompts = await this.getPrompts()
    if (!query.trim()) {
      return allPrompts
    }

    const searchTerm = query.toLowerCase()
    return allPrompts.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(searchTerm) ||
        prompt.content.toLowerCase().includes(searchTerm)
    )
  }

  async cleanup() {
    this.reports.clear()
    this.settings.clear()
    this.tasks.clear()
    this.prompts.clear()
    logger.info('In-memory database cleared')
  }
}
