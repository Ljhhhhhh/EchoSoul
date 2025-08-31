import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../utils/logger'
import type { AnalysisConfig, ReportMeta, TaskStatus, ChatMessage, Contact } from '@types'
import { DatabaseService } from './DatabaseService'
import { ChatlogService } from './ChatlogService'
import { AIServiceManager } from './AIServiceManager'
import { PromptService } from './PromptService'
import { TaskManager } from './TaskManager'

const logger = createLogger('ReportService')

/**
 * 报告生成服务
 * 负责处理报告生成的核心逻辑，包括数据获取、AI分析和报告渲染
 */
export class ReportService {
  private databaseService: DatabaseService
  private chatlogService: ChatlogService
  private aiServiceManager: AIServiceManager
  private promptService: PromptService
  private taskManager: TaskManager
  private reportsDir: string
  private mainWindow: BrowserWindow | null = null

  constructor(
    databaseService: DatabaseService,
    chatlogService: ChatlogService,
    aiServiceManager: AIServiceManager,
    promptService: PromptService,
    taskManager: TaskManager
  ) {
    this.databaseService = databaseService
    this.chatlogService = chatlogService
    this.aiServiceManager = aiServiceManager
    this.promptService = promptService
    this.taskManager = taskManager

    // 设置报告存储目录
    this.reportsDir = path.join(app.getPath('userData'), 'reports')

    logger.info('ReportService initialized')
  }

  /**
   * 设置主窗口
   */
  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow
    logger.info('MainWindow set for ReportService')
  }

  /**
   * 获取主窗口
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * 检查主窗口是否可用
   */
  private ensureMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      throw new Error('MainWindow is not available')
    }
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      // 确保报告目录存在
      await fs.mkdir(this.reportsDir, { recursive: true })
      logger.info('ReportService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize ReportService:', error)
      throw error
    }
  }

  /**
   * 使用AI服务智能归纳临时提示词名称
   */
  private async generatePromptName(promptContent: string): Promise<string> {
    try {
      const aiService = this.aiServiceManager.getHealthyService()
      if (!aiService) {
        logger.warn('No healthy AI service available for prompt naming, using fallback')
        return this.generateFallbackPromptName(promptContent)
      }

      const namingPrompt = `请为以下提示词生成一个简洁、准确的中文名称（不超过10个字）：

${promptContent}

要求：
1. 名称要体现提示词的核心分析目标
2. 使用中文，简洁明了
3. 不要包含"提示词"、"分析"等词汇
4. 只返回名称，不要其他解释

名称：`

      const response = await this.aiServiceManager.sendChatRequest(aiService.id, [
        { role: 'user', content: namingPrompt }
      ])

      let generatedName = ''
      for await (const chunk of response) {
        const token = chunk.choices?.[0]?.delta?.content || ''
        if (token) {
          generatedName += token
        }
      }

      // 清理和验证生成的名称
      const cleanName = generatedName.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
      if (cleanName.length > 0 && cleanName.length <= 15) {
        logger.info(`AI generated prompt name: ${cleanName}`)
        return cleanName
      } else {
        logger.warn(`AI generated invalid name: ${cleanName}, using fallback`)
        return this.generateFallbackPromptName(promptContent)
      }
    } catch (error) {
      logger.error('Failed to generate prompt name with AI:', error)
      return this.generateFallbackPromptName(promptContent)
    }
  }

  /**
   * 生成回退的提示词名称
   */
  private generateFallbackPromptName(promptContent: string): string {
    // 简单的关键词提取和命名逻辑
    const content = promptContent.toLowerCase()

    if (content.includes('情感') || content.includes('emotion')) {
      return '情感分析'
    } else if (content.includes('关系') || content.includes('relationship')) {
      return '关系分析'
    } else if (content.includes('总结') || content.includes('summary')) {
      return '对话总结'
    } else if (content.includes('主题') || content.includes('topic')) {
      return '主题分析'
    } else if (content.includes('时间') || content.includes('time')) {
      return '时间线分析'
    } else {
      return `自定义分析 ${dayjs().format('MM-DD HH:mm')}`
    }
  }

  /**
   * 生成报告
   * @param config 分析配置
   * @returns 报告ID
   */
  async generateReport(config: AnalysisConfig): Promise<string> {
    try {
      // 确保主窗口可用
      this.ensureMainWindow()

      logger.info('Starting report generation...')

      const reportId = uuidv4()

      // 如果是临时提示词且没有名称，先生成名称
      if (config.prompt.isTemporary && !config.prompt.name) {
        logger.info('Generating name for temporary prompt...')

        // 发送命名状态更新
        this.mainWindow?.webContents.send('report-stream-status', {
          reportId,
          status: 'generating_prompt_name',
          message: '正在为提示词生成智能名称...'
        })

        try {
          const generatedName = await this.generatePromptName(config.prompt.content)
          config.prompt.generatedName = generatedName
          config.prompt.name = generatedName

          logger.info(`Generated prompt name: ${generatedName}`)
        } catch (error) {
          logger.error('Failed to generate prompt name:', error)
          config.prompt.name = this.generateFallbackPromptName(config.prompt.content)
        }
      }

      const messages = await this.fetchChatMessages(config)

      if (messages.length === 0) {
        throw new Error('未找到符合条件的聊天记录')
      }

      // 发送开始信号（包含最终的配置信息）
      this.mainWindow?.webContents.send('report-stream-start', {
        reportId,
        messageCount: messages.length,
        config: {
          chatPartner: config.chatPartner,
          timeRange: config.timeRange,
          promptName: config.prompt.name, // 现在已经有名称了
          isTemporaryPrompt: config.prompt.isTemporary
        }
      })

      // 异步执行报告生成
      this.startReportGeneration(reportId, messages, config).catch((error) => {
        logger.error(`Report generation failed for ${reportId}:`, error)
        this.mainWindow?.webContents.send('report-stream-error', {
          reportId,
          error: error.message
        })
      })

      return reportId
    } catch (error) {
      logger.error('Failed to start report generation:', error)
      throw error
    }
  }

  /**
   * 启动报告生成任务
   * @param config 分析配置
   * @returns 任务ID
   */
  async startReportGeneration(
    reportId: string,
    messages: ChatMessage[],
    config: AnalysisConfig
  ): Promise<void> {
    // 步骤3: 执行AI分析
    const stream = await this.performAIAnalysis(messages, config)
    let analysisResult = ''

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || ''
      if (token) {
        analysisResult += token
        // 将每个 token 实时发送到渲染进程
        this.mainWindow?.webContents.send('report-stream-chunk', {
          reportId,
          token,
          content: analysisResult
        })
      }
    }

    // 步骤4: 生成报告文件
    logger.info(`Analysis result: ${analysisResult}`)
    const reportMeta = await this.generateReportFile(
      reportId,
      config,
      analysisResult,
      messages.length
    )

    // 步骤5: 保存报告元数据
    await this.databaseService.saveReport(reportMeta)

    // 所有操作完成后，才发送完成信号
    this.mainWindow?.webContents.send('report-stream-end', {
      reportId,
      finalContent: analysisResult
    })
  }

  /**
   * 获取聊天消息
   */
  private async fetchChatMessages(config: AnalysisConfig): Promise<ChatMessage[]> {
    try {
      // 为每个参与者获取消息
      const messages: ChatMessage[] = await this.chatlogService.getMessages({
        contactId: config.participants,
        startDate: config.timeRange.start,
        endDate: config.timeRange.end
      })

      logger.debug(`Fetched ${messages.length} messages for analysis`)
      return messages.map((item) => {
        return {
          senderName: item.isSelf ? '我' : item.senderName,
          content: item.type === 1 ? item.content : '非文字消息',
          time: item.time
        }
      })
    } catch (error) {
      logger.error('Failed to fetch chat messages:', error)
      throw error
    }
  }

  /**
   * 执行AI分析
   */
  private async performAIAnalysis(
    messages: ChatMessage[],
    config: AnalysisConfig
  ): Promise<AsyncIterable<any>> {
    try {
      // 获取AI服务 - 优先使用指定的服务，否则使用健康的服务
      let aiService = null
      if (config.aiServiceId) {
        aiService = this.aiServiceManager.getService(config.aiServiceId)
        if (!aiService || !aiService.isEnabled) {
          logger.warn(
            `Specified AI service ${config.aiServiceId} is not available, falling back to default`
          )
          aiService = null
        }
      }

      // 如果没有指定服务或指定服务不可用，使用健康的服务
      if (!aiService) {
        aiService = this.aiServiceManager.getHealthyService()
      }

      if (!aiService) {
        throw new Error('没有可用的AI服务')
      }

      logger.info(`Using AI service: ${aiService.name} (${aiService.provider})`)

      const formatMessages = messages
        .map((msg) => {
          const time = dayjs(msg.time).format('YYYY-MM-DD HH:mm:ss')
          const senderName = msg.senderName || msg.sender
          return `[${time}] ${senderName}: ${msg.content}`
        })
        .join('\n')

      // 执行分析
      const stream = await this.aiServiceManager.sendChatRequest(aiService.id, [
        { role: 'system', content: config.prompt.content },
        { role: 'user', content: formatMessages }
      ])

      logger.debug('AI analysis completed')
      return stream
    } catch (error) {
      logger.error('Failed to perform AI analysis:', error)
      throw error
    }
  }

  /**
   * 生成报告文件
   */
  private async generateReportFile(
    taskId: string,
    config: AnalysisConfig,
    analysisResult: string,
    messageCount: number
  ): Promise<ReportMeta> {
    try {
      const timestamp = dayjs().format('YYYYMMDDHHmmss')
      const fileName = `${timestamp}.md`
      const filePath = path.join(this.reportsDir, fileName)

      // 生成报告内容
      const reportContent = this.generateReportContent(config, analysisResult, messageCount)

      // 写入文件
      await fs.writeFile(filePath, reportContent, 'utf-8')

      // 创建报告元数据
      const reportMeta: ReportMeta = {
        id: taskId,
        date: config.timeRange.start,
        title: this.generateReportTitle(config),
        filePath: filePath,
        metadata: {
          messageCount,
          participants: config.participants,
          chatPartner: config.chatPartner,
          prompt: {
            id: config.prompt.id,
            name: config.prompt.name,
            content: config.prompt.content,
            isTemporary: config.prompt.isTemporary,
            generatedName: config.prompt.generatedName
          },
          timeRange: config.timeRange
        },
        summary: analysisResult.substring(0, 100) + '...',
        createdAt: new Date().toISOString()
      }

      logger.debug(`Report file generated: ${filePath}`)
      return reportMeta
    } catch (error) {
      logger.error('Failed to generate report file:', error)
      throw error
    }
  }

  /**
   * 生成报告内容
   */
  private generateReportContent(
    config: AnalysisConfig,
    analysisResult: string,
    messageCount: number
  ): string {
    const participantNames = config.chatPartner
    const timeRange = `${config.timeRange.start} 至 ${config.timeRange.end}`

    return `# ${this.generateReportTitle(config)}

## 报告信息

- **生成时间**: ${new Date().toLocaleString('zh-CN')}
- **分析时间范围**: ${timeRange}
- **聊天对象**: ${participantNames}
- **消息数量**: ${messageCount} 条

## 分析结果

${analysisResult}

---

*此报告由 EchoSoul 自动生成*
`
  }

  /**
   * 生成报告标题
   */
  private generateReportTitle(config: AnalysisConfig): string {
    const chatPartner = config.chatPartner
    const promptName = config.prompt.generatedName || config.prompt.name || '自定义分析'

    return `${chatPartner} - ${promptName}`
  }

  /**
   * 获取报告列表
   */
  async getReports(): Promise<ReportMeta[]> {
    try {
      return await this.databaseService.getReports()
    } catch (error) {
      logger.error('Failed to get reports:', error)
      throw error
    }
  }

  /**
   * 获取报告详情
   */
  async getReport(id: string): Promise<ReportMeta | null> {
    try {
      return await this.databaseService.getReportById(id)
    } catch (error) {
      logger.error(`Failed to get report ${id}:`, error)
      throw error
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus | null> {
    try {
      return await this.taskManager.getTask(taskId)
    } catch (error) {
      logger.error(`Failed to get task status for ${taskId}:`, error)
      throw error
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      return await this.taskManager.cancelTask(taskId)
    } catch (error) {
      logger.error(`Failed to cancel task ${taskId}:`, error)
      return false
    }
  }

  /**
   * 删除报告
   */
  async deleteReport(id: string): Promise<boolean> {
    try {
      const report = await this.databaseService.getReportById(id)
      if (!report) {
        logger.warn(`Report ${id} not found`)
        return false
      }

      // 删除报告文件
      if (report.filePath) {
        try {
          await fs.unlink(report.filePath)
          logger.debug(`Report file deleted: ${report.filePath}`)
        } catch (fileError) {
          logger.warn(`Failed to delete report file ${report.filePath}:`, fileError)
          // 继续删除数据库记录，即使文件删除失败
        }
      }

      // 删除数据库记录
      try {
        await this.databaseService.deleteReport(id)
        logger.info(`Report ${id} deleted successfully`)
        return true
      } catch (dbError) {
        // 如果数据库删除失败，记录错误但不抛出异常
        logger.error(`Failed to delete report from database ${id}:`, dbError)
        return false
      }
    } catch (error) {
      logger.error(`Failed to delete report ${id}:`, error)
      return false
    }
  }

  /**
   * 清理服务
   */
  async cleanup(): Promise<void> {
    logger.info('ReportService cleanup completed')
  }
}
