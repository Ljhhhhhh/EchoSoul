import { useState, useEffect } from 'react'
import { PromptTemplate, NewPromptTemplate } from '@types'
import { promptService } from '../../../services/promptService'
import { useToastNotifications } from './useToastNotifications'

const DEFAULT_NEW_PROMPT: NewPromptTemplate = {
  name: '',
  content: ''
}

export const usePromptManagement = () => {
  const [showAddPrompt, setShowAddPrompt] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [newPrompt, setNewPrompt] = useState<NewPromptTemplate>(DEFAULT_NEW_PROMPT)
  const [searchQuery, setSearchQuery] = useState('')
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(false)

  const {
    showPromptAddSuccess,
    showPromptUpdateSuccess,
    showPromptDeleteSuccess,
    showPromptNameError,
    showPromptContentError
  } = useToastNotifications()

  // 加载所有提示词
  const loadPrompts = async () => {
    try {
      setLoading(true)
      const prompts = await promptService.getAllPrompts()
      setPromptTemplates(prompts)
    } catch (error) {
      console.error('Failed to load prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadPrompts()
  }, [])

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

  const handleAddPrompt = async (promptData: NewPromptTemplate) => {
    if (!validatePrompt(promptData)) return

    try {
      setLoading(true)
      const result = await promptService.createPrompt(promptData)
      if (result.success) {
        await loadPrompts() // 重新加载数据
        setNewPrompt(DEFAULT_NEW_PROMPT)
        setShowAddPrompt(false)
        showPromptAddSuccess(promptData.name)
      } else {
        console.error('Failed to create prompt:', result.message)
      }
    } catch (error) {
      console.error('Failed to create prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrompt = async (updatedPrompt: NewPromptTemplate | Partial<PromptTemplate>) => {
    if (!editingPrompt) return

    // 验证必填字段
    if (!validatePrompt(updatedPrompt as NewPromptTemplate)) return

    try {
      setLoading(true)
      const updateData = {
        name: updatedPrompt.name,
        content: updatedPrompt.content
      }

      const result = await promptService.updatePrompt(editingPrompt.id, updateData)
      if (result.success) {
        await loadPrompts() // 重新加载数据
        setEditingPrompt(null)
        showPromptUpdateSuccess(updatedPrompt.name || editingPrompt.name)
      } else {
        console.error('Failed to update prompt:', result.message)
      }
    } catch (error) {
      console.error('Failed to update prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePrompt = async (promptId: string) => {
    const prompt = promptTemplates.find((p) => p.id === promptId)
    if (!prompt || prompt.isBuiltIn) return

    try {
      setLoading(true)
      const result = await promptService.deletePrompt(promptId)
      if (result.success) {
        await loadPrompts() // 重新加载数据
        showPromptDeleteSuccess(prompt.name)
      } else {
        console.error('Failed to delete prompt:', result.message)
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicatePrompt = async (prompt: PromptTemplate) => {
    try {
      setLoading(true)
      const result = await promptService.duplicatePrompt(prompt.id)
      if (result.success) {
        await loadPrompts() // 重新加载数据
        showPromptAddSuccess(`${prompt.name} (副本)`)
      } else {
        console.error('Failed to duplicate prompt:', result.message)
      }
    } catch (error) {
      console.error('Failed to duplicate prompt:', error)
    } finally {
      setLoading(false)
    }
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
    promptTemplates,
    loading,
    handleAddPrompt,
    handleUpdatePrompt,
    handleRemovePrompt,
    handleDuplicatePrompt,
    updateNewPrompt,
    getUserPrompts,
    getBuiltInPrompts,
    loadPrompts
  }
}
