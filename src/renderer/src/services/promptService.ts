import type {
  PromptTemplate,
  NewPromptTemplate,
  UpdatePromptTemplate,
  PromptOperationResult,
  PromptQueryOptions
} from '@types'

/**
 * 前端Prompt服务，负责与主进程通信
 */
export class PromptService {
  /**
   * 获取所有提示词
   */
  async getAllPrompts(options?: PromptQueryOptions): Promise<PromptTemplate[]> {
    return await window.electron.ipcRenderer.invoke('prompt:getAll', options)
  }

  /**
   * 根据ID获取提示词
   */
  async getPromptById(id: string): Promise<PromptTemplate | null> {
    return await window.electron.ipcRenderer.invoke('prompt:getById', id)
  }

  /**
   * 创建新提示词
   */
  async createPrompt(data: NewPromptTemplate): Promise<PromptOperationResult> {
    return await window.electron.ipcRenderer.invoke('prompt:create', data)
  }

  /**
   * 更新提示词
   */
  async updatePrompt(id: string, updates: UpdatePromptTemplate): Promise<PromptOperationResult> {
    return await window.electron.ipcRenderer.invoke('prompt:update', id, updates)
  }

  /**
   * 删除提示词
   */
  async deletePrompt(id: string): Promise<PromptOperationResult> {
    return await window.electron.ipcRenderer.invoke('prompt:delete', id)
  }

  /**
   * 复制提示词
   */
  async duplicatePrompt(id: string): Promise<PromptOperationResult> {
    return await window.electron.ipcRenderer.invoke('prompt:duplicate', id)
  }

  /**
   * 获取用户自定义提示词
   */
  async getUserPrompts(): Promise<PromptTemplate[]> {
    return await window.electron.ipcRenderer.invoke('prompt:getUserPrompts')
  }

  /**
   * 获取内置提示词
   */
  async getBuiltInPrompts(): Promise<PromptTemplate[]> {
    return await window.electron.ipcRenderer.invoke('prompt:getBuiltInPrompts')
  }

  /**
   * 搜索提示词
   */
  async searchPrompts(query: string): Promise<PromptTemplate[]> {
    return await window.electron.ipcRenderer.invoke('prompt:search', query)
  }

  /**
   * 验证提示词数据
   */
  async validatePrompt(data: unknown): Promise<{ valid: boolean; errors?: string[] }> {
    return await window.electron.ipcRenderer.invoke('prompt:validate', data)
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    total: number
    userCreated: number
    builtIn: number
  }> {
    return await window.electron.ipcRenderer.invoke('prompt:getStats')
  }
}

// 导出单例实例
export const promptService = new PromptService()
