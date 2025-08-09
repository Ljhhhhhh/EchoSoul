/**
 * Prompt管理Hook
 */
import { useState, useEffect } from 'react'
import type { PromptTemplate, PromptState } from '../types'
import { PromptService } from '../services/promptService'

export const usePrompts = () => {
  const [state, setState] = useState<PromptState>({
    prompts: [],
    selectedPrompt: null,
    isLoading: false,
    error: null
  })

  // 加载Prompt模板
  const loadPrompts = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const prompts = await PromptService.loadPrompts()
      setState((prev) => ({
        ...prev,
        prompts,
        isLoading: false
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载Prompt失败'
      }))
    }
  }

  // 选择Prompt
  const selectPrompt = (prompt: PromptTemplate | null) => {
    setState((prev) => ({ ...prev, selectedPrompt: prompt }))
  }

  // 根据ID选择Prompt
  const selectPromptById = (id: string) => {
    const prompt = PromptService.findPromptById(state.prompts, id)
    selectPrompt(prompt)
  }

  // 组件加载时获取数据
  useEffect(() => {
    loadPrompts()
  }, [])

  return {
    ...state,
    selectPrompt,
    selectPromptById,
    loadPrompts
  }
}
