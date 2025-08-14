import { ipcMain } from 'electron'
import { createLogger } from '../utils/logger'
import type { AppServices } from '../services/AppServices'
import type {
  PromptTemplate,
  NewPromptTemplate,
  UpdatePromptTemplate,
  PromptOperationResult,
  PromptQueryOptions
} from '@types'

const logger = createLogger('PromptIPC')

/**
 * 设置Prompt相关的IPC处理器
 */
export function setupPromptHandlers(services: AppServices) {
  logger.info('Setting up Prompt IPC handlers')

  // 获取所有提示词
  ipcMain.handle(
    'prompt:getAll',
    async (_, options?: PromptQueryOptions): Promise<PromptTemplate[]> => {
      try {
        return await services.prompt.getAllPrompts(options)
      } catch (error) {
        logger.error('Failed to get all prompts:', error)
        throw error
      }
    }
  )

  // 根据ID获取提示词
  ipcMain.handle('prompt:getById', async (_, id: string): Promise<PromptTemplate | null> => {
    try {
      return await services.prompt.getPromptById(id)
    } catch (error) {
      logger.error(`Failed to get prompt by id ${id}:`, error)
      throw error
    }
  })

  // 创建新提示词
  ipcMain.handle(
    'prompt:create',
    async (_, data: NewPromptTemplate): Promise<PromptOperationResult> => {
      try {
        return await services.prompt.createPrompt(data)
      } catch (error) {
        logger.error('Failed to create prompt:', error)
        return {
          success: false,
          message: '创建提示词失败'
        }
      }
    }
  )

  // 更新提示词
  ipcMain.handle(
    'prompt:update',
    async (_, id: string, updates: UpdatePromptTemplate): Promise<PromptOperationResult> => {
      try {
        return await services.prompt.updatePrompt(id, updates)
      } catch (error) {
        logger.error('Failed to update prompt:', error)
        return {
          success: false,
          message: '更新提示词失败'
        }
      }
    }
  )

  // 删除提示词
  ipcMain.handle('prompt:delete', async (_, id: string): Promise<PromptOperationResult> => {
    try {
      return await services.prompt.deletePrompt(id)
    } catch (error) {
      logger.error('Failed to delete prompt:', error)
      return {
        success: false,
        message: '删除提示词失败'
      }
    }
  })

  // 复制提示词
  ipcMain.handle('prompt:duplicate', async (_, id: string): Promise<PromptOperationResult> => {
    try {
      return await services.prompt.duplicatePrompt(id)
    } catch (error) {
      logger.error('Failed to duplicate prompt:', error)
      return {
        success: false,
        message: '复制提示词失败'
      }
    }
  })

  // 获取用户自定义提示词
  ipcMain.handle('prompt:getUserPrompts', async (): Promise<PromptTemplate[]> => {
    try {
      return await services.prompt.getUserPrompts()
    } catch (error) {
      logger.error('Failed to get user prompts:', error)
      throw error
    }
  })

  // 获取内置提示词
  ipcMain.handle('prompt:getBuiltInPrompts', async (): Promise<PromptTemplate[]> => {
    try {
      return await services.prompt.getBuiltInPrompts()
    } catch (error) {
      logger.error('Failed to get built-in prompts:', error)
      throw error
    }
  })

  // 搜索提示词
  ipcMain.handle('prompt:search', async (_, query: string): Promise<PromptTemplate[]> => {
    try {
      return await services.prompt.searchPrompts(query)
    } catch (error) {
      logger.error('Failed to search prompts:', error)
      throw error
    }
  })

  // 验证提示词数据
  ipcMain.handle(
    'prompt:validate',
    async (_, data: unknown): Promise<{ valid: boolean; errors?: string[] }> => {
      try {
        return services.prompt.validatePrompt(data)
      } catch (error) {
        logger.error('Failed to validate prompt:', error)
        return {
          valid: false,
          errors: ['验证失败']
        }
      }
    }
  )

  // 获取统计信息
  ipcMain.handle(
    'prompt:getStats',
    async (): Promise<{
      total: number
      userCreated: number
      builtIn: number
    }> => {
      try {
        return await services.prompt.getStats()
      } catch (error) {
        logger.error('Failed to get prompt stats:', error)
        return {
          total: 0,
          userCreated: 0,
          builtIn: 0
        }
      }
    }
  )

  logger.info('Prompt IPC handlers setup completed')
}
