/**
 * 表单相关类型定义
 */

export interface FormData {
  timeRange: string
  customStartDate: string
  customEndDate: string
  targetType: string
  selectedContacts: string
  analysisType: string
  customPrompt: string
}

export interface TimeRange {
  value: string
  label: string
}

export interface FormState extends FormData {
  isGenerating: boolean
}

export interface FormActions {
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
  updateFormData: (data: Partial<FormData>) => void
  resetForm: () => void
  submitForm: () => Promise<void>
}

export interface DataStats {
  messageCount: number
  daysCovered: number
  contactsInvolved: number
}
