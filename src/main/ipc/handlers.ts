import { ipcMain, app } from 'electron'
import { AppServices } from '../services/AppServices'
import { createLogger } from '../utils/logger'
import { setupPromptHandlers } from './promptHandlers'
import type {
  UserSettings,
  AnalysisConfig,
  AIServiceConfig,
  AIServiceStatus,
  AIServiceTestResult,
  AIProvider
} from '@types'

const logger = createLogger('IPC')

export function setupIpcHandlers(services: AppServices) {
  logger.info('Setting up IPC handlers')

  // 设置Prompt相关的IPC处理器
  setupPromptHandlers(services)

  // 配置管理
  ipcMain.handle('config:get', async (): Promise<UserSettings> => {
    try {
      return await services.config.get()
    } catch (error) {
      logger.error('Failed to get config:', error)
      throw error
    }
  })

  ipcMain.handle('config:set', async (_, settings: Partial<UserSettings>): Promise<void> => {
    try {
      await services.config.set(settings)
    } catch (error) {
      logger.error('Failed to set config:', error)
      throw error
    }
  })

  ipcMain.handle(
    'config:test-api',
    async (_, provider: string, apiKey: string): Promise<boolean> => {
      try {
        return await services.config.testApiKey(provider, apiKey)
      } catch (error) {
        logger.error('Failed to test API key:', error)
        return false
      }
    }
  )

  // chatlog服务
  ipcMain.handle('chatlog:status', async () => {
    try {
      return await services.chatlog.checkStatus()
    } catch (error) {
      logger.error('Failed to check chatlog status:', error)
      return 'error'
    }
  })

  ipcMain.handle('chatlog:start', async (): Promise<boolean> => {
    try {
      return await services.chatlog.startService()
    } catch (error) {
      logger.error('Failed to start chatlog service:', error)
      return false
    }
  })

  ipcMain.handle('chatlog:stop', async (): Promise<void> => {
    try {
      await services.chatlog.stopService()
    } catch (error) {
      logger.error('Failed to stop chatlog service:', error)
    }
  })

  ipcMain.handle('chatlog:get-contacts', async () => {
    try {
      return await services.chatlog.getContacts()
    } catch (error) {
      logger.error('Failed to get contacts:', error)
      return []
    }
  })
  ipcMain.handle('chatlog:get-chatroom-list', async () => {
    try {
      return await services.chatlog.getChatroomList()
    } catch (error) {
      logger.error('Failed to get chatroom list:', error)
      return []
    }
  })

  ipcMain.handle('chatlog:get-wechat-key', async () => {
    try {
      return await services.chatlog.getWechatKey()
    } catch (error) {
      logger.error('Failed to get WeChat key:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('chatlog:decrypt-database', async () => {
    try {
      return await services.chatlog.decryptDatabase()
    } catch (error) {
      logger.error('Failed to decrypt database:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('chatlog:check-initialization', async () => {
    try {
      return await services.chatlog.checkInitialization()
    } catch (error) {
      logger.error('Failed to check chatlog initialization:', error)
      return {
        keyObtained: false,
        databaseDecrypted: false,
        canStartServer: false
      }
    }
  })

  // 报告管理 (TODO: 实现报告服务)
  ipcMain.handle('report:list', async () => {
    try {
      // return await services.report.getReports()
      return []
    } catch (error) {
      logger.error('Failed to get reports:', error)
      return []
    }
  })

  ipcMain.handle('report:get', async (_, _id: string): Promise<string | null> => {
    try {
      // return await services.report.getReportContent(id)
      return null
    } catch (error) {
      logger.error('Failed to get report content:', error)
      return null
    }
  })

  ipcMain.handle('report:generate-custom', async (_, _config: AnalysisConfig): Promise<string> => {
    try {
      // return await services.report.generateCustomReport(config)
      throw new Error('Report service not implemented yet')
    } catch (error) {
      logger.error('Failed to generate custom report:', error)
      throw error
    }
  })

  // 任务状态 (TODO: 实现任务服务)
  ipcMain.handle('task:status', async (_, _taskId: string) => {
    try {
      // return await services.report.getTaskStatus(taskId)
      return null
    } catch (error) {
      logger.error('Failed to get task status:', error)
      return null
    }
  })

  ipcMain.handle('task:cancel', async (_, taskId: string): Promise<void> => {
    try {
      // TODO: 实现任务取消逻辑
      logger.info(`Cancelling task: ${taskId}`)
    } catch (error) {
      logger.error('Failed to cancel task:', error)
      throw error
    }
  })

  // AI 服务管理相关
  ipcMain.handle('ai:get-services', async (): Promise<AIServiceConfig[]> => {
    try {
      return services.aiService.getAllServices()
    } catch (error) {
      logger.error('Failed to get AI services:', error)
      return []
    }
  })

  ipcMain.handle(
    'ai:get-service',
    async (_, serviceId: string): Promise<AIServiceConfig | null> => {
      try {
        return services.aiService.getService(serviceId)
      } catch (error) {
        logger.error(`Failed to get AI service ${serviceId}:`, error)
        return null
      }
    }
  )

  ipcMain.handle('ai:add-service', async (_, config: AIServiceConfig): Promise<void> => {
    try {
      await services.aiService.addOrUpdateService(config)
    } catch (error) {
      logger.error('Failed to add AI service:', error)
      throw error
    }
  })

  ipcMain.handle('ai:update-service', async (_, config: AIServiceConfig): Promise<void> => {
    try {
      await services.aiService.addOrUpdateService(config)
    } catch (error) {
      logger.error('Failed to update AI service:', error)
      throw error
    }
  })

  ipcMain.handle('ai:remove-service', async (_, serviceId: string): Promise<void> => {
    try {
      await services.aiService.removeService(serviceId)
    } catch (error) {
      logger.error(`Failed to remove AI service ${serviceId}:`, error)
      throw error
    }
  })

  ipcMain.handle('ai:test-service', async (_, serviceId: string): Promise<AIServiceTestResult> => {
    try {
      return await services.aiService.testService(serviceId)
    } catch (error) {
      logger.error(`Failed to test AI service ${serviceId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle(
    'ai:get-service-status',
    async (_, serviceId: string): Promise<AIServiceStatus | null> => {
      try {
        return services.aiService.getServiceStatus(serviceId)
      } catch (error) {
        logger.error(`Failed to get AI service status ${serviceId}:`, error)
        return null
      }
    }
  )

  ipcMain.handle('ai:get-all-statuses', async (): Promise<AIServiceStatus[]> => {
    try {
      return services.aiService.getAllServiceStatuses()
    } catch (error) {
      logger.error('Failed to get all AI service statuses:', error)
      return []
    }
  })

  ipcMain.handle('ai:get-primary-service', async (): Promise<AIServiceConfig | null> => {
    try {
      return services.aiService.getPrimaryService()
    } catch (error) {
      logger.error('Failed to get primary AI service:', error)
      return null
    }
  })

  ipcMain.handle('ai:set-primary-service', async (_, serviceId: string): Promise<void> => {
    try {
      await services.aiService.setPrimaryService(serviceId)
    } catch (error) {
      logger.error(`Failed to set primary AI service ${serviceId}:`, error)
      throw error
    }
  })

  ipcMain.handle(
    'ai:send-chat-request',
    async (
      _,
      serviceId: string,
      messages: Array<{ role: string; content: string }>,
      options?: { temperature?: number; maxTokens?: number; stream?: boolean }
    ): Promise<{
      content: string
      usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
      model?: string
    }> => {
      try {
        return await services.aiService.sendChatRequest(serviceId, messages, options)
      } catch (error) {
        logger.error(`Failed to send chat request to service ${serviceId}:`, error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'ai:validate-api-key',
    async (_, provider: AIProvider, apiKey: string, baseUrl?: string): Promise<boolean> => {
      try {
        // 这里需要通过 AIProviderFactory 来验证
        const { AIProviderFactory } = await import('../services/ai/AIProviderFactory')
        const adapter = AIProviderFactory.getAdapter(provider)
        return await adapter.validateApiKey(apiKey, baseUrl)
      } catch (error) {
        logger.error(`Failed to validate API key for ${provider}:`, error)
        return false
      }
    }
  )

  ipcMain.handle('ai:get-available-providers', async (): Promise<AIProvider[]> => {
    try {
      const { AIProviderFactory } = await import('../services/ai/AIProviderFactory')
      return AIProviderFactory.getAvailableProviders()
    } catch (error) {
      logger.error('Failed to get available AI providers:', error)
      return []
    }
  })

  ipcMain.handle('ai:get-provider-info', async (_, provider: AIProvider) => {
    try {
      const { AIProviderFactory } = await import('../services/ai/AIProviderFactory')
      const adapter = AIProviderFactory.getAdapter(provider)
      return {
        provider: adapter.provider,
        name: adapter.name,
        description: adapter.description,
        supportedModels: adapter.supportedModels,
        defaultModel: adapter.defaultModel,
        requiresApiKey: adapter.requiresApiKey,
        supportsCustomBaseUrl: adapter.supportsCustomBaseUrl
      }
    } catch (error) {
      logger.error(`Failed to get provider info for ${provider}:`, error)
      return null
    }
  })

  // 开发和调试用的IPC处理器 (TODO: 实现调度服务)
  if (process.env.NODE_ENV === 'development') {
    ipcMain.handle('dev:trigger-daily-report', async () => {
      try {
        // await services.scheduler.triggerDailyReport()
        logger.info('Daily report trigger requested (not implemented yet)')
        return true
      } catch (error) {
        logger.error('Failed to trigger daily report:', error)
        return false
      }
    })
  }

  // 应用控制
  ipcMain.handle('app:quit', async (): Promise<void> => {
    try {
      logger.info('Received quit request from renderer')
      app.quit()
    } catch (error) {
      logger.error('Failed to quit application:', error)
      throw error
    }
  })

  logger.info('IPC handlers setup completed')
}
