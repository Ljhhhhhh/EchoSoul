import { useState, useEffect } from 'react'
import {
  SettingsState,
  PromptTemplate,
  AIServiceConfig,
  SimpleAiConfig,
  createAIServiceConfig,
  extractSimpleConfig
} from '../types'
import { DEFAULT_SETTINGS, BUILT_IN_PROMPTS } from '../constants'

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    ...DEFAULT_SETTINGS,
    promptTemplates: BUILT_IN_PROMPTS
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 初始化时加载AI服务配置和内置提示词
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        // 加载AI服务配置
        const aiServices = await window.api.aiService.getAllServices()

        setSettings((prev) => ({
          ...prev,
          aiConfigs: aiServices,
          promptTemplates: [
            ...BUILT_IN_PROMPTS,
            ...prev.promptTemplates.filter((p) => !p.isBuiltIn)
          ]
        }))
      } catch (err) {
        console.error('Failed to initialize settings:', err)
        setError('加载设置失败')
      } finally {
        setLoading(false)
      }
    }

    initializeSettings()
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

  const addAiConfig = async (simpleConfig: SimpleAiConfig) => {
    try {
      setLoading(true)
      setError(null)

      const fullConfig = createAIServiceConfig(simpleConfig)
      await window.api.aiService.addOrUpdateService(fullConfig)

      setSettings((prev) => ({
        ...prev,
        aiConfigs: [...prev.aiConfigs, fullConfig],
        currentAiConfig: prev.currentAiConfig || fullConfig.id
      }))
    } catch (err) {
      console.error('Failed to add AI config:', err)
      setError('添加AI配置失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeAiConfig = async (configId: string) => {
    try {
      setLoading(true)
      setError(null)

      await window.api.aiService.removeService(configId)

      setSettings((prev) => ({
        ...prev,
        aiConfigs: prev.aiConfigs.filter((c) => c.id !== configId),
        currentAiConfig:
          prev.currentAiConfig === configId
            ? prev.aiConfigs.find((c) => c.id !== configId)?.id || ''
            : prev.currentAiConfig
      }))
    } catch (err) {
      console.error('Failed to remove AI config:', err)
      setError('删除AI配置失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAiConfig = async (configId: string, field: string, value: string | boolean) => {
    try {
      setLoading(true)
      setError(null)

      const existingConfig = settings.aiConfigs.find((c) => c.id === configId)
      if (!existingConfig) {
        throw new Error('配置不存在')
      }

      const currentSimple = extractSimpleConfig(existingConfig)
      const updatedSimple = { ...currentSimple, [field]: value }
      const updatedConfig = createAIServiceConfig(updatedSimple, configId)

      await window.api.aiService.updateService(updatedConfig)

      setSettings((prev) => ({
        ...prev,
        aiConfigs: prev.aiConfigs.map((config) => (config.id === configId ? updatedConfig : config))
      }))
    } catch (err) {
      console.error('Failed to update AI config:', err)
      setError('更新AI配置失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const testAiConfig = async (configId: string) => {
    try {
      setLoading(true)
      setError(null)

      const config = settings.aiConfigs.find((c) => c.id === configId)
      if (!config) {
        throw new Error('配置不存在')
      }

      const result = await window.api.aiService.testService(config)
      return result
    } catch (err) {
      console.error('Failed to test AI config:', err)
      setError('测试AI配置失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const testTempAiConfig = async (config: AIServiceConfig) => {
    try {
      setLoading(true)
      setError(null)

      const result = await window.api.aiService.testTempService(config)
      return {
        success: result.success,
        error: result.error,
        details: result
      }
    } catch (err) {
      console.error('Failed to test temp AI config:', err)
      setError('测试临时AI配置失败')
      return {
        success: false,
        error: err instanceof Error ? err.message : '测试失败'
      }
    } finally {
      setLoading(false)
    }
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
    loading,
    error,
    updateChatlogWorkDir,
    updateCurrentAiConfig,
    updateNotifications,
    updateAutoBackup,
    updateTheme,
    addAiConfig,
    removeAiConfig,
    updateAiConfig,
    testAiConfig,
    testTempAiConfig,
    addPromptTemplate,
    updatePromptTemplate,
    removePromptTemplate
  }
}
