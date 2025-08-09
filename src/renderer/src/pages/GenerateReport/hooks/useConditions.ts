/**
 * 条件管理Hook
 */
import { useState, useEffect } from 'react'
import type { SavedCondition, ConditionsState } from '../types'
import { ConditionService } from '../services/conditionService'

export const useConditions = () => {
  const [state, setState] = useState<ConditionsState>({
    savedConditions: [],
    showSavedConditions: false
  })

  // 加载保存的条件
  useEffect(() => {
    const conditions = ConditionService.loadConditions()
    setState({
      savedConditions: conditions,
      showSavedConditions: conditions.length > 0
    })
  }, [])

  // 保存条件到状态和localStorage
  const saveConditionsToStorage = (conditions: SavedCondition[]) => {
    ConditionService.saveConditions(conditions)
    setState((prev) => ({ ...prev, savedConditions: conditions }))
  }

  // 保存当前条件
  const saveCondition = (formData: any, timeRanges: any[], selectedPrompt: any) => {
    const name = ConditionService.generateConditionName(formData, timeRanges, selectedPrompt)
    const newCondition = ConditionService.createCondition(formData, name)

    const existingIndex = ConditionService.findSimilarCondition(state.savedConditions, formData)

    let updatedConditions: SavedCondition[]
    if (existingIndex >= 0) {
      updatedConditions = [...state.savedConditions]
      updatedConditions[existingIndex] = ConditionService.incrementUsage(
        updatedConditions[existingIndex]
      )
    } else {
      updatedConditions = [newCondition, ...state.savedConditions].slice(0, 10)
    }

    saveConditionsToStorage(updatedConditions)
  }

  // 应用保存的条件
  const applyCondition = (
    condition: SavedCondition,
    onApply: (condition: SavedCondition) => void
  ) => {
    const updatedConditions = state.savedConditions.map((c) =>
      c.id === condition.id ? ConditionService.incrementUsage(c) : c
    )
    saveConditionsToStorage(updatedConditions)
    onApply(condition)
  }

  // 删除保存的条件
  const deleteCondition = (id: string) => {
    const updatedConditions = ConditionService.removeCondition(state.savedConditions, id)
    saveConditionsToStorage(updatedConditions)
  }

  // 切换显示状态
  const toggleDisplay = () => {
    setState((prev) => ({ ...prev, showSavedConditions: !prev.showSavedConditions }))
  }

  // 按使用次数排序
  const sortedConditions = ConditionService.sortByUsage(state.savedConditions)

  return {
    ...state,
    sortedConditions,
    saveCondition,
    applyCondition,
    deleteCondition,
    toggleDisplay
  }
}
