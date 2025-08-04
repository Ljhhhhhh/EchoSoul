import { useState, useEffect } from 'react'
import { SettingsState, PromptTemplate } from '../types'
import { DEFAULT_SETTINGS, BUILT_IN_PROMPTS } from '../constants'

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    ...DEFAULT_SETTINGS,
    promptTemplates: BUILT_IN_PROMPTS
  })

  // 初始化时加载内置提示词
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      promptTemplates: [...BUILT_IN_PROMPTS, ...prev.promptTemplates.filter((p) => !p.isBuiltIn)]
    }))
  }, [])

  const updateChatlogWorkDir = (workDir: string) => {
    setSettings((prev) => ({ ...prev, chatlogWorkDir: workDir }))
  }

  const updateCurrentAiConfig = (configId: string) => {
    setSettings((prev) => ({ ...prev, currentAiConfig: configId }))
  }

  const updateNotifications = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, notifications: enabled }))
  }

  const updateAutoBackup = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, autoBackup: enabled }))
  }

  const updateTheme = (theme: string) => {
    setSettings((prev) => ({ ...prev, theme }))
  }

  const addAiConfig = (config: any) => {
    setSettings((prev) => ({
      ...prev,
      aiConfigs: [...prev.aiConfigs, config],
      currentAiConfig: prev.currentAiConfig || config.id
    }))
  }

  const removeAiConfig = (configId: string) => {
    setSettings((prev) => ({
      ...prev,
      aiConfigs: prev.aiConfigs.filter((c) => c.id !== configId),
      currentAiConfig:
        prev.currentAiConfig === configId
          ? prev.aiConfigs.find((c) => c.id !== configId)?.id || ''
          : prev.currentAiConfig
    }))
  }

  const updateAiConfig = (configId: string, field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      aiConfigs: prev.aiConfigs.map((config) =>
        config.id === configId ? { ...config, [field]: value } : config
      )
    }))
  }

  const addPromptTemplate = (prompt: PromptTemplate) => {
    setSettings((prev) => ({
      ...prev,
      promptTemplates: [...prev.promptTemplates, prompt]
    }))
  }

  const updatePromptTemplate = (promptId: string, updatedPrompt: Partial<PromptTemplate>) => {
    setSettings((prev) => ({
      ...prev,
      promptTemplates: prev.promptTemplates.map((prompt) =>
        prompt.id === promptId
          ? { ...prompt, ...updatedPrompt, updatedAt: new Date().toISOString() }
          : prompt
      )
    }))
  }

  const removePromptTemplate = (promptId: string) => {
    setSettings((prev) => ({
      ...prev,
      promptTemplates: prev.promptTemplates.filter((prompt) => prompt.id !== promptId)
    }))
  }

  return {
    settings,
    setSettings,
    updateChatlogWorkDir,
    updateCurrentAiConfig,
    updateNotifications,
    updateAutoBackup,
    updateTheme,
    addAiConfig,
    removeAiConfig,
    updateAiConfig,
    addPromptTemplate,
    updatePromptTemplate,
    removePromptTemplate
  }
}
