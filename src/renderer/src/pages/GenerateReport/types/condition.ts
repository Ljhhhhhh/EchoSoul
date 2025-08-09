/**
 * 保存条件相关类型定义
 */

export interface SavedCondition {
  id: string
  name: string
  timeRange: string
  customStartDate: string
  customEndDate: string
  targetType: string
  selectedContacts: string[]
  analysisType: string
  customPrompt: string
  createdAt: string
  usageCount: number
}

export interface ConditionsState {
  savedConditions: SavedCondition[]
  showSavedConditions: boolean
}

export interface ConditionActions {
  saveCondition: (condition: Omit<SavedCondition, 'id' | 'createdAt' | 'usageCount'>) => void
  applyCondition: (condition: SavedCondition) => void
  deleteCondition: (id: string) => void
  toggleDisplay: () => void
}
