import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { createLogger } from '../utils/logger'
import type { ReportMeta, TaskStatus, PromptTemplate } from '@types'
import { BUILT_IN_PROMPTS } from '../utils/prompt'

const logger = createLogger('DatabaseService')

// SQLite 数据库实现
export class DatabaseService {
  private db: Database.Database | null = null
  private dbPath: string
  private readonly DB_VERSION = 3

  constructor() {
    const userDataPath = app.getPath('userData')
    const isDev = process.env.NODE_ENV === 'development'
    this.dbPath = path.join(userDataPath, isDev ? 'echosoul-dev.db' : 'echosoul.db')
  }

  async initialize() {
    try {
      logger.info(`Initializing SQLite database at: ${this.dbPath}`)

      // 确保目录存在
      const dbDir = path.dirname(this.dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      // 初始化数据库连接
      this.db = new Database(this.dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? logger.debug : undefined
      })

      // 启用 WAL 模式以提高并发性能
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('synchronous = NORMAL')
      this.db.pragma('cache_size = 1000')
      this.db.pragma('temp_store = memory')

      // 创建表结构
      this.createTables()

      // 检查并执行数据库迁移
      await this.runMigrations()

      // 初始化内置提示词
      await this.initializeBuiltInPrompts()

      logger.info('SQLite database initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize database:', error)
      throw error
    }
  }

  private createTables() {
    if (!this.db) throw new Error('Database not initialized')

    // 创建版本表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY
      )
    `)

    // 创建报告表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        metadata TEXT NOT NULL,
        created_at TEXT NOT NULL,
        summary TEXT,
        UNIQUE(id)
      )
    `)

    // 创建设置表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建任务状态表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        error_message TEXT,
        result TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建提示词模板表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        is_built_in INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_prompts_is_built_in ON prompts(is_built_in);
      CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at);
    `)
  }

  private async runMigrations() {
    if (!this.db) throw new Error('Database not initialized')

    const getCurrentVersion = this.db.prepare(
      'SELECT version FROM db_version ORDER BY version DESC LIMIT 1'
    )
    const setVersion = this.db.prepare('INSERT OR REPLACE INTO db_version (version) VALUES (?)')

    let currentVersion = 0
    try {
      const result = getCurrentVersion.get() as { version: number } | undefined
      currentVersion = result?.version || 0
    } catch (error) {
      // 表不存在，版本为 0
    }

    if (currentVersion < this.DB_VERSION) {
      logger.info(
        `Running database migrations from version ${currentVersion} to ${this.DB_VERSION}`
      )

      // 在这里添加未来的迁移逻辑
      // if (currentVersion < 1) {
      //   // 迁移到版本 1 的逻辑
      // }

      if (currentVersion < 2) {
        // 迁移到版本 2：移除 tasks 表中的 type 字段
        logger.info('Migrating to version 2: Removing type field from tasks table')

        // 创建新表结构（没有 type 字段）
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS tasks_new (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            error_message TEXT,
            result TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `)

        // 迁移数据
        this.db.exec(`
          INSERT INTO tasks_new (id, status, progress, error_message, result, created_at, updated_at)
          SELECT id, status, progress, error_message, result, created_at, updated_at FROM tasks
        `)

        // 删除旧表，重命名新表
        this.db.exec(`
          DROP TABLE tasks;
          ALTER TABLE tasks_new RENAME TO tasks;
        `)

        // 重建索引
        this.db.exec(`
          CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
          CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
        `)

        logger.info('Migration to version 2 completed')
      }

      if (currentVersion < 3) {
        // 迁移到版本 3：为 reports 表添加 summary 字段
        logger.info('Migrating to version 3: Adding summary field to reports table')

        // 检查字段是否已存在，如果不存在则添加
        try {
          this.db.exec('ALTER TABLE reports ADD COLUMN summary TEXT')
          logger.info('Added summary column to reports table')
        } catch (error) {
          // 字段可能已存在，忽略错误
          logger.debug('Summary column may already exist:', error)
        }

        logger.info('Migration to version 3 completed')
      }

      setVersion.run(this.DB_VERSION)
      logger.info('Database migrations completed')
    }
  }

  private async initializeBuiltInPrompts() {
    if (!this.db) throw new Error('Database not initialized')

    const insertPrompt = this.db.prepare(`
      INSERT OR IGNORE INTO prompts (id, name, content, is_built_in, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `)

    const transaction = this.db.transaction((prompts: PromptTemplate[]) => {
      for (const prompt of prompts) {
        insertPrompt.run(prompt.id, prompt.name, prompt.content, prompt.createdAt, prompt.updatedAt)
      }
    })

    transaction(BUILT_IN_PROMPTS)
    logger.info(`Initialized ${BUILT_IN_PROMPTS.length} built-in prompts`)
  }

  // 报告相关操作
  async saveReport(report: ReportMeta): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO reports (id, date, title, file_path, metadata, created_at, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      report.id,
      report.date,
      report.title,
      report.filePath,
      JSON.stringify(report.metadata),
      report.createdAt,
      report.summary || null
    )

    logger.debug(`Saved report: ${report.id}`)
  }

  async getReports(): Promise<ReportMeta[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT id, date, title, file_path, metadata, created_at, summary
      FROM reports
      ORDER BY date DESC, created_at DESC
    `)

    const rows = stmt.all() as Array<{
      id: string
      date: string
      title: string
      file_path: string
      metadata: string
      created_at: string
      summary: string | null
    }>

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      title: row.title,
      filePath: row.file_path,
      metadata: JSON.parse(row.metadata),
      createdAt: row.created_at,
      summary: row.summary || undefined
    }))
  }

  async getReportById(id: string): Promise<ReportMeta | null> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT id, date, title, file_path, metadata, created_at, summary
      FROM reports
      WHERE id = ?
    `)

    const row = stmt.get(id) as
      | {
          id: string
          date: string
          title: string
          file_path: string
          metadata: string
          created_at: string
          summary: string | null
        }
      | undefined

    if (!row) return null

    // 从文件中读取 content
    let reportContent: string | undefined
    if (fs.existsSync(row.file_path)) {
      try {
        reportContent = fs.readFileSync(row.file_path, 'utf-8')
      } catch (error) {
        logger.warn(`Failed to read report file ${row.file_path}:`, error)
      }
    }

    return {
      id: row.id,
      date: row.date,
      title: row.title,
      filePath: row.file_path,
      metadata: JSON.parse(row.metadata),
      createdAt: row.created_at,
      content: reportContent,
      summary: row.summary || undefined
    }
  }

  async deleteReport(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const report = await this.getReportById(id)
    if (report) {
      fs.unlinkSync(report.filePath)
    }

    const stmt = this.db.prepare('DELETE FROM reports WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw new Error(`Report with id ${id} not found`)
    }

    logger.debug(`Deleted report: ${id}`)
  }

  async updateReportSummary(id: string, summary: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      UPDATE reports
      SET summary = ?
      WHERE id = ?
    `)

    const result = stmt.run(summary, id)
    const success = result.changes > 0

    if (success) {
      logger.debug(`Updated report summary: ${id}`)
    }
    return success
  }

  // 配置相关操作
  async getSetting(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
    const row = stmt.get(key) as { value: string } | undefined
    return row?.value || null
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `)

    stmt.run(key, value, new Date().toISOString())
    logger.debug(`Updated setting: ${key}`)
  }

  // 任务状态相关操作
  async saveTaskStatus(task: TaskStatus): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tasks (id, status, progress, error_message, result, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      task.id,
      task.status,
      task.progress,
      task.errorMessage || null,
      task.result ? JSON.stringify(task.result) : null,
      task.createdAt,
      task.updatedAt
    )

    logger.debug(`Saved task status: ${task.id} - ${task.status}`)
  }

  async getTaskStatus(id: string): Promise<TaskStatus | null> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT id, status, progress, error_message, result, created_at, updated_at
      FROM tasks
      WHERE id = ?
    `)

    const row = stmt.get(id) as
      | {
          id: string
          status: string
          progress: number
          error_message: string | null
          result: string | null
          created_at: string
          updated_at: string
        }
      | undefined

    if (!row) return null

    return {
      id: row.id,
      status: row.status as TaskStatus['status'],
      progress: row.progress,
      errorMessage: row.error_message || undefined,
      result: row.result ? JSON.parse(row.result) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw new Error(`Task with id ${id} not found`)
    }

    logger.debug(`Deleted task: ${id}`)
  }

  // Prompt相关操作
  async savePrompt(prompt: PromptTemplate): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO prompts (id, name, content, is_built_in, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      prompt.id,
      prompt.name,
      prompt.content,
      prompt.isBuiltIn ? 1 : 0,
      prompt.createdAt,
      prompt.updatedAt
    )

    logger.debug(`Saved prompt: ${prompt.id}`)
  }

  async getPrompts(): Promise<PromptTemplate[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT id, name, content, is_built_in, created_at, updated_at
      FROM prompts
      ORDER BY is_built_in DESC, updated_at DESC
    `)

    const rows = stmt.all() as Array<{
      id: string
      name: string
      content: string
      is_built_in: number
      created_at: string
      updated_at: string
    }>

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      content: row.content,
      isBuiltIn: row.is_built_in === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async getPromptById(id: string): Promise<PromptTemplate | null> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT id, name, content, is_built_in, created_at, updated_at
      FROM prompts
      WHERE id = ?
    `)

    const row = stmt.get(id) as
      | {
          id: string
          name: string
          content: string
          is_built_in: number
          created_at: string
          updated_at: string
        }
      | undefined

    if (!row) return null

    return {
      id: row.id,
      name: row.name,
      content: row.content,
      isBuiltIn: row.is_built_in === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async updatePrompt(id: string, updates: Partial<PromptTemplate>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    // 首先检查提示词是否存在且不是内置的
    const existing = await this.getPromptById(id)
    if (!existing || existing.isBuiltIn) {
      return false
    }

    const updatedAt = new Date().toISOString()
    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.content !== undefined) {
      fields.push('content = ?')
      values.push(updates.content)
    }

    if (fields.length === 0) {
      return false // 没有更新内容
    }

    fields.push('updated_at = ?')
    values.push(updatedAt)
    values.push(id) // WHERE 条件的参数

    const stmt = this.db.prepare(`
      UPDATE prompts
      SET ${fields.join(', ')}
      WHERE id = ? AND is_built_in = 0
    `)

    const result = stmt.run(...values)
    const success = result.changes > 0

    if (success) {
      logger.debug(`Updated prompt: ${id}`)
    }
    return success
  }

  async deletePrompt(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      DELETE FROM prompts
      WHERE id = ? AND is_built_in = 0
    `)

    const result = stmt.run(id)
    const success = result.changes > 0

    if (success) {
      logger.debug(`Deleted prompt: ${id}`)
    }
    return success
  }

  async searchPrompts(query: string): Promise<PromptTemplate[]> {
    if (!this.db) throw new Error('Database not initialized')

    if (!query.trim()) {
      return this.getPrompts()
    }

    const stmt = this.db.prepare(`
      SELECT id, name, content, is_built_in, created_at, updated_at
      FROM prompts
      WHERE name LIKE ? OR content LIKE ?
      ORDER BY is_built_in DESC, updated_at DESC
    `)

    const searchTerm = `%${query}%`
    const rows = stmt.all(searchTerm, searchTerm) as Array<{
      id: string
      name: string
      content: string
      is_built_in: number
      created_at: string
      updated_at: string
    }>

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      content: row.content,
      isBuiltIn: row.is_built_in === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async cleanup() {
    if (this.db) {
      try {
        this.db.close()
        this.db = null
        logger.info('Database connection closed')
      } catch (error) {
        logger.error('Error closing database:', error)
      }
    }
  }

  // 数据库备份功能
  async backup(backupPath: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.backup(backupPath)
      logger.info(`Database backed up to: ${backupPath}`)
    } catch (error) {
      logger.error('Database backup failed:', error)
      throw error
    }
  }

  // 获取数据库统计信息
  async getStats(): Promise<{
    reports: number
    settings: number
    tasks: number
    prompts: number
    builtInPrompts: number
    customPrompts: number
  }> {
    if (!this.db) throw new Error('Database not initialized')

    const getCount = (table: string, condition?: string) => {
      const sql = `SELECT COUNT(*) as count FROM ${table}${condition ? ` WHERE ${condition}` : ''}`
      const result = this.db!.prepare(sql).get() as { count: number }
      return result.count
    }

    return {
      reports: getCount('reports'),
      settings: getCount('settings'),
      tasks: getCount('tasks'),
      prompts: getCount('prompts'),
      builtInPrompts: getCount('prompts', 'is_built_in = 1'),
      customPrompts: getCount('prompts', 'is_built_in = 0')
    }
  }

  // 数据库健康检查
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      if (!this.db) {
        return { healthy: false, error: 'Database not initialized' }
      }

      // 执行简单查询测试连接
      this.db.prepare('SELECT 1').get()
      return { healthy: true }
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 优化数据库（清理和重建索引）
  async optimize(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      logger.info('Starting database optimization...')

      // 清理未使用的空间
      this.db.exec('VACUUM')

      // 重新分析表统计信息
      this.db.exec('ANALYZE')

      logger.info('Database optimization completed')
    } catch (error) {
      logger.error('Database optimization failed:', error)
      throw error
    }
  }
}
