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
        id: 'emotion-analysis',
        name: '情感分析',
        content:
          '请分析这些聊天记录中的情感变化，包括：\n1. 主要情绪类型和强度\n2. 情绪变化的时间模式\n3. 影响情绪的关键因素\n4. 情绪管理的建议',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 'personality-analysis',
        name: '人格分析',
        content:
          '基于这些聊天记录，请分析我的人格特征：\n1. 主要性格特点\n2. 沟通风格和习惯\n3. 价值观和兴趣偏好\n4. 人际交往模式\n5. 个人成长建议',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 'relationship-analysis',
        name: '关系分析',
        content:
          '请分析我与这些联系人的关系模式：\n1. 互动频率和时间分布\n2. 话题偏好和共同兴趣\n3. 沟通风格的匹配度\n4. 关系发展趋势\n5. 改善关系的建议',
        isBuiltIn: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 'work-atmosphere',
        name: '工作氛围分析',
        content:
          '请分析这些工作群聊的氛围：\n1. 团队协作模式\n2. 沟通效率和质量\n3. 工作压力和情绪状态\n4. 团队凝聚力\n5. 改善工作氛围的建议',
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
