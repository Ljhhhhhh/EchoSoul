import { createLogger } from '../utils/logger'
import { DatabaseService } from './DatabaseService'
import {
  PromptTemplate,
  NewPromptTemplate,
  UpdatePromptTemplate,
  PromptOperationResult,
  PromptQueryOptions,
  BUILT_IN_PROMPTS,
  PromptTemplateSchema,
  NewPromptTemplateSchema,
  UpdatePromptTemplateSchema
} from '../../types/prompt'
import { z } from 'zod'

const logger = createLogger('PromptService')

export class PromptService {
  private db: DatabaseService
  private initialized = false

  constructor(db: DatabaseService) {
    this.db = db
  }

  /**
   * 初始化服务，加载内置提示词
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      logger.info('Initializing PromptService')

      // 加载内置提示词
      await this.loadBuiltInPrompts()

      this.initialized = true
      logger.info('PromptService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize PromptService:', error)
      throw error
    }
  }

  /**
   * 加载内置提示词
   */
  private async loadBuiltInPrompts(): Promise<void> {
    for (const prompt of BUILT_IN_PROMPTS) {
      const existing = await this.db.getPromptById(prompt.id)
      if (!existing) {
        await this.db.savePrompt(prompt)
        logger.debug(`Loaded built-in prompt: ${prompt.name}`)
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * 获取所有提示词
   */
  async getAllPrompts(options: PromptQueryOptions = {}): Promise<PromptTemplate[]> {
    try {
      const { includeBuiltIn = true, searchQuery } = options

      let prompts: PromptTemplate[]

      if (searchQuery) {
        prompts = await this.db.searchPrompts(searchQuery)
      } else {
        prompts = await this.db.getPrompts()
      }

      if (!includeBuiltIn) {
        prompts = prompts.filter((p) => !p.isBuiltIn)
      }

      return prompts
    } catch (error) {
      logger.error('Failed to get prompts:', error)
      throw error
    }
  }

  /**
   * 根据ID获取提示词
   */
  async getPromptById(id: string): Promise<PromptTemplate | null> {
    try {
      return await this.db.getPromptById(id)
    } catch (error) {
      logger.error(`Failed to get prompt by id ${id}:`, error)
      throw error
    }
  }

  /**
   * 创建新提示词
   */
  async createPrompt(data: NewPromptTemplate): Promise<PromptOperationResult> {
    try {
      // 验证输入数据
      const validatedData = NewPromptTemplateSchema.parse(data)

      // 检查名称是否重复
      const existingPrompts = await this.db.getPrompts()
      const nameExists = existingPrompts.some(
        (p) => p.name.toLowerCase() === validatedData.name.toLowerCase()
      )

      if (nameExists) {
        return {
          success: false,
          message: '提示词名称已存在，请使用其他名称'
        }
      }

      // 创建新提示词
      const newPrompt: PromptTemplate = {
        id: this.generateId(),
        name: validatedData.name,
        content: validatedData.content,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.db.savePrompt(newPrompt)

      logger.info(`Created new prompt: ${newPrompt.name} (${newPrompt.id})`)

      return {
        success: true,
        message: '提示词创建成功',
        data: newPrompt
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join(', ')
        return {
          success: false,
          message: `数据验证失败: ${message}`
        }
      }

      logger.error('Failed to create prompt:', error)
      return {
        success: false,
        message: '创建提示词失败'
      }
    }
  }

  /**
   * 更新提示词
   */
  async updatePrompt(id: string, updates: UpdatePromptTemplate): Promise<PromptOperationResult> {
    try {
      // 验证输入数据
      const validatedUpdates = UpdatePromptTemplateSchema.parse(updates)

      // 检查提示词是否存在
      const existing = await this.db.getPromptById(id)
      if (!existing) {
        return {
          success: false,
          message: '提示词不存在'
        }
      }

      // 检查是否为内置提示词
      if (existing.isBuiltIn) {
        return {
          success: false,
          message: '内置提示词不能修改'
        }
      }

      // 检查名称是否重复（如果更新了名称）
      if (validatedUpdates.name && validatedUpdates.name !== existing.name) {
        const existingPrompts = await this.db.getPrompts()
        const nameExists = existingPrompts.some(
          (p) => p.id !== id && p.name.toLowerCase() === validatedUpdates.name!.toLowerCase()
        )

        if (nameExists) {
          return {
            success: false,
            message: '提示词名称已存在，请使用其他名称'
          }
        }
      }

      // 更新提示词
      const success = await this.db.updatePrompt(id, validatedUpdates)

      if (!success) {
        return {
          success: false,
          message: '更新提示词失败'
        }
      }

      const updatedPrompt = await this.db.getPromptById(id)

      logger.info(`Updated prompt: ${existing.name} (${id})`)

      return {
        success: true,
        message: '提示词更新成功',
        data: updatedPrompt!
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join(', ')
        return {
          success: false,
          message: `数据验证失败: ${message}`
        }
      }

      logger.error('Failed to update prompt:', error)
      return {
        success: false,
        message: '更新提示词失败'
      }
    }
  }

  /**
   * 删除提示词
   */
  async deletePrompt(id: string): Promise<PromptOperationResult> {
    try {
      // 检查提示词是否存在
      const existing = await this.db.getPromptById(id)
      if (!existing) {
        return {
          success: false,
          message: '提示词不存在'
        }
      }

      // 检查是否为内置提示词
      if (existing.isBuiltIn) {
        return {
          success: false,
          message: '内置提示词不能删除'
        }
      }

      // 删除提示词
      const success = await this.db.deletePrompt(id)

      if (!success) {
        return {
          success: false,
          message: '删除提示词失败'
        }
      }

      logger.info(`Deleted prompt: ${existing.name} (${id})`)

      return {
        success: true,
        message: '提示词删除成功'
      }
    } catch (error) {
      logger.error('Failed to delete prompt:', error)
      return {
        success: false,
        message: '删除提示词失败'
      }
    }
  }

  /**
   * 复制提示词
   */
  async duplicatePrompt(id: string): Promise<PromptOperationResult> {
    try {
      const original = await this.db.getPromptById(id)
      if (!original) {
        return {
          success: false,
          message: '原提示词不存在'
        }
      }

      // 创建副本
      const duplicateData: NewPromptTemplate = {
        name: `${original.name} (副本)`,
        content: original.content
      }

      return await this.createPrompt(duplicateData)
    } catch (error) {
      logger.error('Failed to duplicate prompt:', error)
      return {
        success: false,
        message: '复制提示词失败'
      }
    }
  }

  /**
   * 获取用户自定义提示词
   */
  async getUserPrompts(): Promise<PromptTemplate[]> {
    return await this.getAllPrompts({ includeBuiltIn: false })
  }

  /**
   * 获取内置提示词
   */
  async getBuiltInPrompts(): Promise<PromptTemplate[]> {
    const allPrompts = await this.getAllPrompts()
    return allPrompts.filter((p) => p.isBuiltIn)
  }

  /**
   * 搜索提示词
   */
  async searchPrompts(query: string): Promise<PromptTemplate[]> {
    return await this.getAllPrompts({ searchQuery: query })
  }

  /**
   * 验证提示词数据
   */
  validatePrompt(data: unknown): { valid: boolean; errors?: string[] } {
    try {
      NewPromptTemplateSchema.parse(data)
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message)
        }
      }
      return {
        valid: false,
        errors: ['未知验证错误']
      }
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    total: number
    userCreated: number
    builtIn: number
  }> {
    try {
      const allPrompts = await this.getAllPrompts()
      const userPrompts = allPrompts.filter((p) => !p.isBuiltIn)
      const builtInPrompts = allPrompts.filter((p) => p.isBuiltIn)

      return {
        total: allPrompts.length,
        userCreated: userPrompts.length,
        builtIn: builtInPrompts.length
      }
    } catch (error) {
      logger.error('Failed to get prompt stats:', error)
      return {
        total: 0,
        userCreated: 0,
        builtIn: 0
      }
    }
  }
}
