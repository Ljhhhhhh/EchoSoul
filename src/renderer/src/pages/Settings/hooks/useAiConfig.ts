import { useState } from 'react'
import { NewAiConfig, AiConfig } from '../types'
import { DEFAULT_NEW_CONFIG, PROVIDER_TEMPLATES } from '../constants'
import { useToastNotifications } from './useToastNotifications'

interface UseAiConfigProps {
  onAddConfig: (config: AiConfig) => void
  onRemoveConfig: (configId: string) => void
  onSwitchConfig: (configId: string) => void
  onUpdateConfig: (configId: string, field: string, value: string | boolean) => void
  aiConfigs: AiConfig[]
}

export const useAiConfig = ({
  onAddConfig,
  onRemoveConfig,
  onSwitchConfig,
  onUpdateConfig,
  aiConfigs
}: UseAiConfigProps) => {
  const [showAddConfig, setShowAddConfig] = useState(false)
  const [newConfig, setNewConfig] = useState<NewAiConfig>(DEFAULT_NEW_CONFIG)
  const {
    showAiTestSuccess,
    showConfigSwitchSuccess,
    showConfigAddSuccess,
    showConfigDeleteSuccess,
    showConfigNameError
  } = useToastNotifications()

  const handleProviderChange = (provider: string) => {
    const template = PROVIDER_TEMPLATES[provider]
    setNewConfig((prev) => ({
      ...prev,
      provider,
      model: template.defaultModel,
      baseUrl: template.baseUrl
    }))
  }

  const handleAddConfig = () => {
    if (!newConfig.name.trim()) {
      showConfigNameError()
      return
    }

    const template = PROVIDER_TEMPLATES[newConfig.provider]
    const configId = Date.now().toString()

    const aiConfig: AiConfig = {
      id: configId,
      name: newConfig.name,
      provider: newConfig.provider,
      apiKey: newConfig.apiKey,
      model: newConfig.model || template.defaultModel,
      baseUrl: newConfig.baseUrl || template.baseUrl,
      enabled: true
    }

    onAddConfig(aiConfig)
    setNewConfig(DEFAULT_NEW_CONFIG)
    setShowAddConfig(false)
    showConfigAddSuccess(newConfig.name)
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
      showAiTestSuccess(config.name)
    }
  }

  const updateNewConfig = (field: keyof NewAiConfig, value: string) => {
    setNewConfig((prev) => ({ ...prev, [field]: value }))
  }

  return {
    showAddConfig,
    setShowAddConfig,
    newConfig,
    setNewConfig,
    handleProviderChange,
    handleAddConfig,
    handleRemoveConfig,
    handleSwitchConfig,
    handleTestConnection,
    updateNewConfig,
    onUpdateConfig
  }
}
