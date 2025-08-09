/**
 * Prompt模板服务
 */
import type { PromptTemplate } from '../types'

export class PromptService {
  /**
   * 获取内置Prompt模板
   */
  static getBuiltInPrompts(): PromptTemplate[] {
    return [
      {
        id: '1',
        name: '情感分析专家',
        content: '请分析聊天记录中的情感变化趋势，识别主要情绪状态...',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '2',
        name: '关系洞察师',
        content: '深度分析聊天双方的关系模式，包括互动频率、话题偏好...',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '3',
        name: '沟通模式分析',
        content: '分析沟通风格、表达习惯和互动模式...',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '4',
        name: '工作氛围评估',
        content: '评估团队协作氛围、工作效率和团队凝聚力...',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]
  }

  /**
   * 根据ID查找Prompt
   */
  static findPromptById(prompts: PromptTemplate[], id: string): PromptTemplate | null {
    return prompts.find((prompt) => prompt.id === id) || null
  }

  /**
   * 加载所有Prompt模板
   */
  static async loadPrompts(): Promise<PromptTemplate[]> {
    try {
      // TODO: 后续可以从API加载自定义Prompt
      return this.getBuiltInPrompts()
    } catch (error) {
      console.error('Failed to load prompts:', error)
      throw new Error('加载Prompt模板失败')
    }
  }

  /**
   * 验证Prompt模板
   */
  static validatePrompt(prompt: Partial<PromptTemplate>): boolean {
    return !!(prompt.name && prompt.name.trim() && prompt.content && prompt.content.trim())
  }
}
