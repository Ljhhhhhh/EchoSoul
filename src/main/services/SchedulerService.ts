import * as cron from 'node-cron'
import { createLogger } from '../utils/logger'
import { ChatlogService } from './ChatlogService'
import { ReportService } from './ReportService'
// import { getYesterday } from '@echosoul/common';

const logger = createLogger('SchedulerService')

export class SchedulerService {
  private jobs = new Map<string, cron.ScheduledTask>()

  private getYesterday(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  constructor(
    private chatlog: ChatlogService,
    private report: ReportService
  ) {}

  async initialize() {
    logger.info('SchedulerService initialized')
    this.setupDailyReportJob()
  }

  private setupDailyReportJob() {
    // 每日凌晨2点生成报告
    const dailyTask = cron.schedule(
      '0 2 * * *',
      async () => {
        await this.generateDailyReport()
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai'
      }
    )

    this.jobs.set('daily-report', dailyTask)
    dailyTask.start()

    logger.info('Daily report job scheduled for 2:00 AM')
  }

  private async generateDailyReport() {
    try {
      logger.info('Starting daily report generation')

      // 检查chatlog服务状态
      const status = await this.chatlog.checkStatus()
      if (status !== 'running') {
        logger.warn('Chatlog service not running, skipping daily report')
        return
      }

      const yesterday = this.getYesterday()

      // 获取昨天的聊天记录
      const messages = await this.chatlog.getMessages({
        startDate: yesterday,
        endDate: yesterday
      })

      if (messages.length === 0) {
        logger.info('No messages found for yesterday, skipping report generation')
        return
      }

      // 生成报告
      const reportContent = `# ${yesterday} 每日聊天分析报告

## 基础统计
- **消息总数**: ${messages.length}条
- **分析日期**: ${yesterday}

## 简要分析
昨日共产生 ${messages.length} 条聊天记录。

---
*报告生成时间: ${new Date().toLocaleString()}*
`

      await this.report.saveReport(reportContent, 'auto')

      // TODO: 发送系统通知
      logger.info(`Daily report generated successfully for ${yesterday}`)
    } catch (error) {
      logger.error('Failed to generate daily report:', error)
    }
  }

  // 手动触发每日报告生成（用于测试）
  async triggerDailyReport(): Promise<void> {
    await this.generateDailyReport()
  }

  // 更新定时任务时间
  async updateSchedule(cronTime: string): Promise<void> {
    const dailyTask = this.jobs.get('daily-report')
    if (dailyTask) {
      dailyTask.stop()
      this.jobs.delete('daily-report')
    }

    // 创建新的定时任务
    const newTask = cron.schedule(
      cronTime,
      async () => {
        await this.generateDailyReport()
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai'
      }
    )

    this.jobs.set('daily-report', newTask)
    newTask.start()

    logger.info(`Daily report schedule updated to: ${cronTime}`)
  }

  async cleanup() {
    // 停止所有定时任务
    for (const [name, task] of this.jobs) {
      task.stop()
      logger.info(`Stopped scheduled task: ${name}`)
    }
    this.jobs.clear()

    logger.info('SchedulerService cleaned up')
  }
}
