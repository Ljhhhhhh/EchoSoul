/**
 * 性能优化的表单状态管理 Hook
 */
import { useReducer, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormData, TimeRange, DataStats } from '../types'
import { DataStatsService } from '../services/dataStatsService'
import { useToast } from '../../../hooks/use-toast'

// 表单状态管理的 Action 类型
type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: any }
  | { type: 'UPDATE_FORM_DATA'; data: Partial<FormData> }
  | { type: 'ADD_CONTACT'; contactId: string }
  | { type: 'REMOVE_CONTACT'; contactId: string }
  | { type: 'CLEAR_CONTACTS' }
  | { type: 'SET_GENERATING'; isGenerating: boolean }
  | { type: 'RESET_FORM' }

interface FormState extends FormData {
  isGenerating: boolean
}

const initialFormState: FormState = {
  timeRange: '',
  customStartDate: '',
  customEndDate: '',
  targetType: '',
  selectedContacts: [],
  analysisType: '',
  customPrompt: '',
  isGenerating: false
}

// 表单状态 Reducer
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value }

    case 'UPDATE_FORM_DATA':
      return { ...state, ...action.data }

    case 'ADD_CONTACT':
      if (state.selectedContacts.includes(action.contactId)) {
        return state
      }
      return {
        ...state,
        selectedContacts: [...state.selectedContacts, action.contactId]
      }

    case 'REMOVE_CONTACT':
      return {
        ...state,
        selectedContacts: state.selectedContacts.filter((id) => id !== action.contactId)
      }

    case 'CLEAR_CONTACTS':
      return { ...state, selectedContacts: [] }

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.isGenerating }

    case 'RESET_FORM':
      return initialFormState

    default:
      return state
  }
}

export const useOptimizedFormState = (personalContacts: any[], groupChats: any[]) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(formReducer, initialFormState)

  // 时间范围选项 - 使用 useMemo 缓存
  const timeRanges: TimeRange[] = useMemo(
    () => [
      { value: 'yesterday', label: '昨天' },
      { value: 'last_week', label: '最近一周' },
      { value: 'last_month', label: '最近一个月' },
      { value: 'last_3_months', label: '最近三个月' },
      { value: 'custom', label: '自定义时间' }
    ],
    []
  )

  // 使用 useCallback 缓存函数，避免不必要的重渲染
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value })
  }, [])

  const updateFormData = useCallback((data: Partial<FormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', data })
  }, [])

  const addContact = useCallback((contactId: string) => {
    dispatch({ type: 'ADD_CONTACT', contactId })
  }, [])

  const removeContact = useCallback((contactId: string) => {
    dispatch({ type: 'REMOVE_CONTACT', contactId })
  }, [])

  const clearAllContacts = useCallback(() => {
    dispatch({ type: 'CLEAR_CONTACTS' })
  }, [])

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' })
  }, [])

  // 计算数据统计 - 使用 useMemo 优化性能
  const dataStats: DataStats = useMemo(() => {
    return DataStatsService.calculateStats(state, personalContacts, groupChats)
  }, [state.timeRange, state.targetType, state.selectedContacts, personalContacts, groupChats])

  // 表单验证 - 使用 useMemo 避免重复计算
  const isFormValid = useMemo(() => {
    return !!(state.timeRange && state.analysisType && state.selectedContacts.length > 0)
  }, [state.timeRange, state.analysisType, state.selectedContacts])

  // 提交表单
  const submitForm = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', isGenerating: true })

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: '报告生成成功！',
        description: '你的个性化分析报告已经准备好了。'
      })

      navigate('/history')
    } catch (error) {
      toast({
        title: '生成失败',
        description: '报告生成过程中出现错误，请重试。'
      })
    } finally {
      dispatch({ type: 'SET_GENERATING', isGenerating: false })
    }
  }, [toast, navigate])

  return {
    formData: state,
    isGenerating: state.isGenerating,
    timeRanges,
    dataStats,
    isFormValid,
    updateField,
    updateFormData,
    resetForm,
    addContact,
    removeContact,
    clearAllContacts,
    submitForm
  }
}
