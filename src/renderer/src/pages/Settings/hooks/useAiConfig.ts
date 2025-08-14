import { useState } from 'react'
import { SimpleAiConfig, AIServiceConfig, createAIServiceConfig } from '../types'
import { DEFAULT_NEW_CONFIG, PROVIDER_TEMPLATES } from '../constants'
import { useToastNotifications } from './useToastNotifications'

interface UseAiConfigProps {
  onAddConfig: (config: AIServiceConfig) => void
  onRemoveConfig: (configId: string) => void
  onSwitchConfig: (configId: string) => void
  onUpdateConfig: (configId: string, field: string, value: string | boolean) => void
  onTestConfig: (configId: string) => void
  onTestTempConfig?: (config: AIServiceConfig) => Promise<{
    success: boolean
    error?: string
    details?: any
  }>
  aiConfigs: AIServiceConfig[]
}

export const useAiConfig = ({
  onAddConfig,
  onRemoveConfig,
  onSwitchConfig,
  onUpdateConfig,
  onTestConfig,
  onTestTempConfig,
  aiConfigs
}: UseAiConfigProps) => {
  const [showAddConfig, setShowAddConfig] = useState(false)
  const [newConfig, setNewConfig] = useState<SimpleAiConfig>(DEFAULT_NEW_CONFIG)
  const [isAddingConfig, setIsAddingConfig] = useState(false)
  const [isTestingConfig, setIsTestingConfig] = useState(false)
  const [isTestPassed, setIsTestPassed] = useState(false)
  const [availableModels, setAvailableModels] = useState<
    Array<{
      id: string
      name: string
      contextLength?: number
      pricing?: { prompt: number; completion: number }
    }>
  >([])
  const {
    showAiTestSuccess,
    showConfigSwitchSuccess,
    showConfigAddSuccess,
    showConfigDeleteSuccess,
    showConfigNameError,
    showAiTestError
  } = useToastNotifications()

  const handleProviderChange = (provider: string) => {
    const template = PROVIDER_TEMPLATES[provider]
    setNewConfig((prev) => ({
      ...prev,
      provider,
      model: template.defaultModel,
      baseUrl: template.baseUrl
    }))
    // 当提供商改变时，重置验证状态和可用模型
    setIsTestPassed(false)
    setAvailableModels([])
  }

  const handleTestConfig = async () => {
    if (!newConfig.name.trim() || !newConfig.apiKey.trim()) {
      return
    }

    setIsTestingConfig(true)
    try {
      const template = PROVIDER_TEMPLATES[newConfig.provider]
      const configId = Date.now().toString()

      const aiConfig = createAIServiceConfig(
        {
          name: newConfig.name,
          provider: newConfig.provider as any,
          apiKey: newConfig.apiKey,
          model: newConfig.model || template.defaultModel,
          baseUrl: newConfig.baseUrl || template.baseUrl,
          isEnabled: true
        },
        configId
      )

      if (onTestTempConfig) {
        const result = await onTestTempConfig(aiConfig)
        if (result.success) {
          setIsTestPassed(true)
          // 如果返回了可用模型，更新状态
          if (result.details?.availableModels) {
            setAvailableModels(result.details.availableModels)
          }
          showAiTestSuccess(newConfig.name)
        } else {
          setIsTestPassed(false)
          showAiTestError(newConfig.name, result.error || '测试失败')
        }
      } else {
        // 如果没有临时测试函数，使用现有的测试逻辑
        await onTestConfig(configId)
        setIsTestPassed(true)
        showAiTestSuccess(newConfig.name)
      }
    } catch (error) {
      console.error('AI service test failed:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showAiTestError(newConfig.name, errorMessage)
      setIsTestPassed(false)
    } finally {
      setIsTestingConfig(false)
    }
  }

  const handleAddConfig = async () => {
    if (!newConfig.name.trim()) {
      showConfigNameError()
      return
    }

    if (!isTestPassed) {
      return
    }

    setIsAddingConfig(true)
    try {
      const template = PROVIDER_TEMPLATES[newConfig.provider]
      const configId = Date.now().toString()

      const aiConfig = createAIServiceConfig(
        {
          name: newConfig.name,
          provider: newConfig.provider as any,
          apiKey: newConfig.apiKey,
          model: newConfig.model || template.defaultModel,
          baseUrl: newConfig.baseUrl || template.baseUrl,
          isEnabled: true
        },
        configId
      )

      onAddConfig(aiConfig)
      showConfigAddSuccess(newConfig.name)
      setShowAddConfig(false)
      setNewConfig(DEFAULT_NEW_CONFIG)
      setIsTestPassed(false)
    } catch (error) {
      console.error('Failed to add config:', error)
    } finally {
      setIsAddingConfig(false)
    }
  }

  const handleRemoveConfig = (configId: string) => {
    const config = aiConfigs.find((c) => c.id === configId)
    onRemoveConfig(configId)
    if (config) {
      showConfigDeleteSuccess(config.name)
    }
  }

  const handleSwitchConfig = (configId: string) => {
    const config = aiConfigs.find((c) => c.id === configId)
    onSwitchConfig(configId)
    if (config) {
      showConfigSwitchSuccess(config.name)
    }
  }

  const handleTestConnection = async (configId: string) => {
    const config = aiConfigs.find((c) => c.id === configId)
    if (config) {
      try {
        await onTestConfig(configId)
        showAiTestSuccess(config.name)
      } catch (error) {
        console.error('AI service test failed:', error)
        // 这里可以添加错误提示
      }
    }
  }

  const updateNewConfig = (field: keyof SimpleAiConfig, value: string) => {
    setNewConfig((prev) => ({ ...prev, [field]: value }))
    // 只有在关键配置改变时才重置验证状态，模型选择不应该重置
    const criticalFields: (keyof SimpleAiConfig)[] = ['provider', 'apiKey', 'baseUrl']
    if (isTestPassed && criticalFields.includes(field)) {
      setIsTestPassed(false)
      setAvailableModels([])
    }
  }

  return {
    showAddConfig,
    setShowAddConfig,
    newConfig,
    setNewConfig,
    isAddingConfig,
    isTestingConfig,
    isTestPassed,
    availableModels,
    handleProviderChange,
    handleAddConfig,
    handleRemoveConfig,
    handleSwitchConfig,
    handleTestConnection,
    handleTestConfig,
    updateNewConfig,
    onUpdateConfig
  }
}
