import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'
import { createLogger } from '../utils/logger'
import { DatabaseService } from './DatabaseService'
// import { AnalysisService } from './AnalysisService'
import type { ReportMeta, AnalysisConfig, TaskStatus } from '@types'

const logger = createLogger('ReportService')

export class ReportService {
  private reportsDir: string

  // 工具函数
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  constructor(
    private database: DatabaseService
    // TODO: 将来会使用 AnalysisService 进行报告生成
    // private analysis: AnalysisService
  ) {
    const userDataPath = app.getPath('userData')
    this.reportsDir = path.join(userDataPath, 'reports')
  }

  async initialize() {
    // 确保报告目录存在
    try {
      await fs.mkdir(this.reportsDir, { recursive: true })
      logger.info(`Reports directory created at: ${this.reportsDir}`)
    } catch (error) {
      logger.error('Failed to create reports directory:', error)
      throw error
    }
  }

  async generateCustomReport(config: AnalysisConfig, taskId?: string): Promise<string> {
    const actualTaskId = taskId || this.generateId()

    try {
      // 创建任务记录
      await this.createTask(actualTaskId, 'custom-report')

      // TODO: 获取聊天数据并生成报告
      // 这里先创建一个模拟报告
      await this.updateTaskProgress(actualTaskId, 50, '生成报告中...')

      const reportContent = `# 自定义分析报告

## 分析配置
- **时间范围**: ${config.timeRange.start} 至 ${config.timeRange.end}
- **分析维度**: ${config.dimensions.join(', ')}
${config.participants ? `- **分析对象**: ${config.participants.join(', ')}` : ''}

## 报告内容
这是一个模拟的自定义报告内容。

---
*报告生成时间: ${new Date().toLocaleString()}*
`

      const reportMeta = await this.saveReport(reportContent, 'custom', config)

      await this.updateTaskProgress(actualTaskId, 100, '报告生成完成')
      await this.completeTask(actualTaskId, reportMeta.id, reportMeta.filePath)

      return reportMeta.id
    } catch (error) {
      await this.failTask(actualTaskId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  async saveReport(
    content: string,
    type: 'auto' | 'custom',
    config?: AnalysisConfig
  ): Promise<ReportMeta> {
    const id = this.generateId()
    const date = this.formatDate(new Date())
    const timestamp = new Date().toISOString()

    // 生成文件名
    let fileName = `${date}-${type}`
    if (type === 'custom' && config?.participants?.length) {
      const participantName = config.participants[0]
      fileName += `-${participantName}`
    }
    fileName += '.md'

    const filePath = path.join(this.reportsDir, fileName)

    // 写入文件
    await fs.writeFile(filePath, content, 'utf-8')

    // 创建元数据
    const reportMeta: ReportMeta = {
      id,
      type,
      date,
      title: type === 'auto' ? `${date} 每日报告` : `自定义报告 - ${date}`,
      filePath,
      metadata: {
        messageCount: 0, // TODO: 从实际数据获取
        timeRange: config?.timeRange || { start: date, end: date },
        participants: config?.participants || [],
        analysisConfig: config || ({} as AnalysisConfig)
      },
      createdAt: timestamp
    }

    // 保存到数据库
    await this.database.saveReport(reportMeta)

    logger.info(`Report saved: ${fileName}`)
    return reportMeta
  }

  async getReports(): Promise<ReportMeta[]> {
    return await this.database.getReports()
  }

  async getReportContent(id: string): Promise<string | null> {
    const reportMeta = await this.database.getReportById(id)
    if (!reportMeta) return null

    try {
      const content = await fs.readFile(reportMeta.filePath, 'utf-8')
      return content
    } catch (error) {
      logger.error(`Failed to read report file: ${reportMeta.filePath}`, error)
      return null
    }
  }

  // 任务管理方法
  private async createTask(id: string, type: 'daily-report' | 'custom-report'): Promise<void> {
    const task: TaskStatus = {
      id,
      type,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.database.saveTaskStatus(task)
  }

  private async updateTaskProgress(id: string, progress: number, message?: string): Promise<void> {
    const task = await this.database.getTaskStatus(id)
    if (!task) return

    task.status = progress === 100 ? 'completed' : 'running'
    task.progress = progress
    task.updatedAt = new Date().toISOString()

    await this.database.saveTaskStatus(task)

    // TODO: 发送IPC事件通知前端
    logger.info(`Task ${id} progress: ${progress}% - ${message || ''}`)
  }

  private async completeTask(id: string, reportId: string, filePath: string): Promise<void> {
    const task = await this.database.getTaskStatus(id)
    if (!task) return

    task.status = 'completed'
    task.progress = 100
    task.result = { reportId, filePath }
    task.updatedAt = new Date().toISOString()

    await this.database.saveTaskStatus(task)
  }

  private async failTask(id: string, errorMessage: string): Promise<void> {
    const task = await this.database.getTaskStatus(id)
    if (!task) return

    task.status = 'failed'
    task.errorMessage = errorMessage
    task.updatedAt = new Date().toISOString()

    await this.database.saveTaskStatus(task)
  }

  async getTaskStatus(id: string): Promise<TaskStatus | null> {
    return await this.database.getTaskStatus(id)
  }

  async cleanup() {
    logger.info('ReportService cleaned up')
  }
}
