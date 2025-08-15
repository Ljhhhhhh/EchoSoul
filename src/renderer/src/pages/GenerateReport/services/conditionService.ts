/**
 * 条件保存管理服务
 */
import type { SavedCondition } from '../types'

const STORAGE_KEY = 'savedReportConditions'

export class ConditionService {
  /**
   * 从localStorage加载保存的条件
   */
  static loadConditions(): SavedCondition[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Failed to load saved conditions:', error)
      return []
    }
  }

  /**
   * 保存条件到localStorage
   */
  static saveConditions(conditions: SavedCondition[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions))
    } catch (error) {
      console.error('Failed to save conditions:', error)
      throw new Error('保存条件失败')
    }
  }

  /**
   * 生成条件名称
   */
  static generateConditionName(
    data: any,
    timeRanges: Array<{ value: string; label: string }>,
    selectedPrompt: any
  ): string {
    const timeLabel = timeRanges.find((t) => t.value === data.timeRange)?.label || '自定义时间'
    const analysisLabel = selectedPrompt?.name || '未选择分析类型'

    let targetLabel = '全部聊天'
    if (data.targetType === 'specific') {
      // 处理数组格式的selectedContacts（来自SavedCondition）
      if (Array.isArray(data.selectedContacts)) {
        targetLabel = data.selectedContacts.length > 0 ? `${data.selectedContacts.length}个联系人` : '特定联系人'
      } else {
        // 处理单个联系人格式（来自当前表单）
        targetLabel = data.selectedContacts ? '1个联系人' : '特定联系人'
      }
    } else if (data.targetType === 'groups') {
      targetLabel = '群聊'
    }

    return `${timeLabel} · ${targetLabel} · ${analysisLabel}`
  }

  /**
   * 创建新条件
   */
  static createCondition(formData: any, name: string): SavedCondition {
    return {
      id: Date.now().toString(),
      name,
      ...formData,
      // 将单个联系人转换为数组格式以保持向后兼容
      selectedContacts: formData.selectedContacts ? [formData.selectedContacts] : [],
      createdAt: new Date().toISOString(),
      usageCount: 1
    }
  }

  /**
   * 查找相同条件
   */
  static findSimilarCondition(conditions: SavedCondition[], formData: any): number {
    return conditions.findIndex(
      (condition) => {
        // 将formData的单个联系人转换为数组格式进行比较
        const formContacts = formData.selectedContacts ? [formData.selectedContacts] : []
        
        // 比较 analysisType (可能是字符串或对象)
        let analysisTypeMatches = false
        if (typeof condition.analysisType === 'string' && typeof formData.analysisType === 'string') {
          analysisTypeMatches = condition.analysisType === formData.analysisType
        } else if (typeof condition.analysisType === 'object' && typeof formData.analysisType === 'object') {
          // 如果两者都是对象，比较id
          analysisTypeMatches = condition.analysisType?.id === formData.analysisType?.id
        }
        
        return (
          condition.timeRange === formData.timeRange &&
          condition.targetType === formData.targetType &&
          analysisTypeMatches &&
          JSON.stringify(condition.selectedContacts.sort()) ===
            JSON.stringify(formContacts.sort())
        )
      }
    )
  }

  /**
   * 更新条件使用次数
   */
  static incrementUsage(condition: SavedCondition): SavedCondition {
    return {
      ...condition,
      usageCount: condition.usageCount + 1
    }
  }

  /**
   * 删除条件
   */
  static removeCondition(conditions: SavedCondition[], id: string): SavedCondition[] {
    return conditions.filter((c) => c.id !== id)
  }

  /**
   * 按使用次数排序
   */
  static sortByUsage(conditions: SavedCondition[]): SavedCondition[] {
    return [...conditions].sort((a, b) => b.usageCount - a.usageCount)
  }
}
