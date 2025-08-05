import { useState } from 'react'
import { PromptTemplate, NewPromptTemplate } from '../types'
import { DEFAULT_NEW_PROMPT } from '../constants'
import { useToastNotifications } from './useToastNotifications'

interface UsePromptManagementProps {
  promptTemplates: PromptTemplate[]
  onAddPrompt: (prompt: PromptTemplate) => void
  onUpdatePrompt: (promptId: string, updatedPrompt: Partial<PromptTemplate>) => void
  onRemovePrompt: (promptId: string) => void
}

export const usePromptManagement = ({
  promptTemplates,
  onAddPrompt,
  onUpdatePrompt,
  onRemovePrompt
}: UsePromptManagementProps) => {
  const [showAddPrompt, setShowAddPrompt] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [newPrompt, setNewPrompt] = useState<NewPromptTemplate>(DEFAULT_NEW_PROMPT)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    showPromptAddSuccess,
    showPromptUpdateSuccess,
    showPromptDeleteSuccess,
    showPromptNameError,
    showPromptContentError
  } = useToastNotifications()

  const generatePromptId = (): string => {
    return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  const validatePrompt = (prompt: NewPromptTemplate): boolean => {
    if (!prompt.name.trim()) {
      showPromptNameError()
      return false
    }
    if (!prompt.content.trim()) {
      showPromptContentError()
      return false
    }
    return true
  }

  const handleAddPrompt = (promptData: NewPromptTemplate) => {
    if (!validatePrompt(promptData)) return

    const promptTemplate: PromptTemplate = {
      id: generatePromptId(),
      ...promptData,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onAddPrompt(promptTemplate)
    setNewPrompt(DEFAULT_NEW_PROMPT)
    setShowAddPrompt(false)
    showPromptAddSuccess(promptData.name)
  }

  const handleUpdatePrompt = (updatedPrompt: NewPromptTemplate | Partial<PromptTemplate>) => {
    if (!editingPrompt) return

    // 验证必填字段
    if (!validatePrompt(updatedPrompt as NewPromptTemplate)) return

    const updateData: Partial<PromptTemplate> = {
      name: updatedPrompt.name,
      content: updatedPrompt.content,
      updatedAt: new Date().toISOString()
    }

    onUpdatePrompt(editingPrompt.id, updateData)
    setEditingPrompt(null)
    showPromptUpdateSuccess(updatedPrompt.name || editingPrompt.name)
  }

  const handleRemovePrompt = (promptId: string) => {
    const prompt = promptTemplates.find((p) => p.id === promptId)
    if (prompt && !prompt.isBuiltIn) {
      onRemovePrompt(promptId)
      showPromptDeleteSuccess(prompt.name)
    }
  }

  const handleDuplicatePrompt = (prompt: PromptTemplate) => {
    const duplicatedPrompt: PromptTemplate = {
      ...prompt,
      id: generatePromptId(),
      name: `${prompt.name} (副本)`,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onAddPrompt(duplicatedPrompt)
    showPromptAddSuccess(duplicatedPrompt.name)
  }

  const updateNewPrompt = (field: keyof NewPromptTemplate, value: string) => {
    setNewPrompt((prev) => ({ ...prev, [field]: value }))
  }

  const filteredPrompts = promptTemplates.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getUserPrompts = () => {
    return promptTemplates.filter((prompt) => !prompt.isBuiltIn)
  }

  const getBuiltInPrompts = () => {
    return promptTemplates.filter((prompt) => prompt.isBuiltIn)
  }

  return {
    showAddPrompt,
    setShowAddPrompt,
    editingPrompt,
    setEditingPrompt,
    newPrompt,
    setNewPrompt,
    searchQuery,
    setSearchQuery,
    filteredPrompts,
    handleAddPrompt,
    handleUpdatePrompt,
    handleRemovePrompt,
    handleDuplicatePrompt,
    updateNewPrompt,
    getUserPrompts,
    getBuiltInPrompts
  }
}
