/**
 * 表单状态管理Hook
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormData, FormState, TimeRange, DataStats } from '../types'
import { DataStatsService } from '../services/dataStatsService'
import { useToast } from '../../../hooks/use-toast'

const initialFormData: FormData = {
  timeRange: '',
  customStartDate: '',
  customEndDate: '',
  targetType: 'individual',
  selectedContacts: null,
  analysisType: '',
  customPrompt: ''
}

export const useFormState = (personalContacts: any[], groupChats: any[]) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isGenerating, setIsGenerating] = useState(false)

  // 时间范围选项
  const timeRanges: TimeRange[] = [
    { value: 'yesterday', label: '昨天' },
    { value: 'last_week', label: '最近一周' },
    { value: 'last_month', label: '最近一个月' },
    { value: 'last_3_months', label: '最近三个月' },
    { value: 'custom', label: '自定义时间' }
  ]

  // 更新单个字段
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 更新整个表单数据
  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  // 重置表单
  const resetForm = () => {
    setFormData(initialFormData)
  }

  // 添加联系人
  const addContact = (contactId: string) => {
    if (formData.selectedContacts !== contactId) {
      setFormData((prev) => ({
        ...prev,
        selectedContacts: contactId
      }))
    }
  }

  // 移除联系人
  const removeContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: prev.selectedContacts === contactId ? null : contactId
    }))
  }

  // 计算数据统计
  const dataStats: DataStats = useMemo(() => {
    return DataStatsService.calculateStats(formData, personalContacts, groupChats)
  }, [formData, personalContacts, groupChats])

  // 提交表单
  const submitForm = async () => {
    setIsGenerating(true)

    try {
      // TODO 调用 IPC 发起生成报告请求
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
      setIsGenerating(false)
    }
  }

  // 表单验证
  const isFormValid = useMemo(() => {
    return !!(formData.timeRange && formData.analysisType && formData.selectedContacts)
  }, [formData])

  return {
    formData,
    isGenerating,
    timeRanges,
    dataStats,
    isFormValid,
    updateField,
    updateFormData,
    resetForm,
    addContact,
    removeContact,
    submitForm
  }
}
