/**
 * 表单状态管理Hook
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { FormData, FormState, TimeRange, DataStats } from '../types'
import { DataStatsService } from '../services/dataStatsService'
import { useToast } from '../../../hooks/use-toast'

const initialFormData: FormData = {
  timeRange: '',
  customStartDate: '',
  customEndDate: '',
  targetType: 'individual',
  selectedContacts: null,
  selectedContactName: null,
  analysisType: null,
  customPrompt: '',
  selectedAiService: null
}

export const useFormState = (
  personalContacts: any[],
  groupChats: any[],
  aiServices: any[] = []
) => {
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

  // 根据时间范围计算开始和结束时间
  const calculateTimeRange = (
    timeRange: string,
    customStartDate?: string,
    customEndDate?: string
  ) => {
    const today = dayjs()

    switch (timeRange) {
      case 'yesterday': {
        const yesterday = today.subtract(1, 'day')
        return {
          start: yesterday.format('YYYY-MM-DD'),
          end: yesterday.format('YYYY-MM-DD')
        }
      }
      case 'last_week': {
        const weekAgo = today.subtract(7, 'day')
        return {
          start: weekAgo.format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD')
        }
      }
      case 'last_month': {
        const monthAgo = today.subtract(1, 'month')
        return {
          start: monthAgo.format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD')
        }
      }
      case 'last_3_months': {
        const threeMonthsAgo = today.subtract(3, 'month')
        return {
          start: threeMonthsAgo.format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD')
        }
      }
      case 'custom': {
        return {
          start: customStartDate || '',
          end: customEndDate || ''
        }
      }
      default: {
        return {
          start: '',
          end: ''
        }
      }
    }
  }

  // 提交表单
  const submitForm = async () => {
    if (!validateForm()) {
      toast({
        title: '表单验证失败',
        description: '请检查所有必填字段是否已填写。'
      })
      return
    }

    setIsGenerating(true)

    try {
      // 根据 timeRange 来生成开始、结束时间
      const timeRangeConfig = calculateTimeRange(
        formData.timeRange,
        formData.customStartDate,
        formData.customEndDate
      )

      // 构造 AnalysisConfig 对象
      const analysisConfig = {
        timeRange: timeRangeConfig,
        participants: formData.selectedContacts,
        chatPartner: formData.selectedContactName,
        prompt: formData.analysisType || { id: '', content: '' }
      }

      // 调用生成报告API
      const taskId = await window.api.report.generateReport(analysisConfig)
      console.log('Report generation started with task ID:', taskId)

      // 显示成功消息
      toast({
        title: '报告生成已开始',
        description: '正在跳转到报告详情页面...',
        duration: 2000
      })

      // // 立即跳转到报告详情页面，传递taskId作为参数
      // navigate(`/report/${taskId}?generating=true`)
    } catch (error) {
      console.error('报告生成失败:', error)
      toast({
        title: '生成失败',
        description: '报告生成过程中出现错误，请重试。'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 表单验证
  const validateForm = (): boolean => {
    // 检查必填字段
    const hasTimeRange = !!formData.timeRange
    const hasAnalysisType = !!formData.analysisType
    const hasSelectedContacts = !!formData.selectedContacts
    const hasSelectedAiService = !!formData.selectedAiService

    // 如果没有可用的AI服务，则不要求选择AI服务
    const aiServiceRequired = aiServices.length > 0 ? hasSelectedAiService : true

    return hasTimeRange && hasAnalysisType && hasSelectedContacts && aiServiceRequired
  }

  const isFormValid = useMemo(() => {
    return validateForm()
  }, [formData, aiServices])

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
