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
  // 多选模型相关状态
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
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
    // 测试时只需要 API Key，不需要配置名称
    if (!newConfig.apiKey.trim() || !newConfig.provider) {
      return
    }

    setIsTestingConfig(true)
    try {
      const template = PROVIDER_TEMPLATES[newConfig.provider]
      const configId = Date.now().toString()

      // 测试时使用临时名称，如果用户没有填写名称
      const testName = newConfig.name.trim() || `${template.name} 测试配置`

      const aiConfig = createAIServiceConfig(
        {
          name: testName,
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
          showAiTestSuccess(template.name)
        } else {
          setIsTestPassed(false)
          showAiTestError(template.name, result.error || '测试失败')
        }
      } else {
        // 如果没有临时测试函数，使用现有的测试逻辑
        await onTestConfig(configId)
        setIsTestPassed(true)
        showAiTestSuccess(template.name)
      }
    } catch (error) {
      console.error('AI service test failed:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      const template = PROVIDER_TEMPLATES[newConfig.provider]
      showAiTestError(template.name, errorMessage)
      setIsTestPassed(false)
    } finally {
      setIsTestingConfig(false)
    }
  }

  // 检查配置名称是否冲突并生成唯一名称
  const generateUniqueConfigName = (baseName: string, existingConfigs: AIServiceConfig[]): string => {
    const existingNames = existingConfigs.map(config => config.name.toLowerCase())
    let uniqueName = baseName
    let counter = 1
    
    while (existingNames.includes(uniqueName.toLowerCase())) {
      uniqueName = `${baseName} (${counter})`
      counter++
    }
    
    return uniqueName
  }

  const handleAddConfig = async () => {
    if (!newConfig.name.trim()) {
      showConfigNameError()
      return
    }

    if (!isTestPassed) {
      return
    }

    // 检查多选模式下是否有选中的模型
    if (isMultiSelect && selectedModels.length === 0) {
      // 可以添加一个提示用户选择模型的toast
      return
    }

    setIsAddingConfig(true)
    try {
      const template = PROVIDER_TEMPLATES[newConfig.provider]
      
      if (isMultiSelect && selectedModels.length > 0) {
        // 批量创建配置
        const baseTime = Date.now()
        const baseName = newConfig.name.trim()
        const createdConfigs: AIServiceConfig[] = []
        
        for (let i = 0; i < selectedModels.length; i++) {
          const modelId = selectedModels[i]
          const model = availableModels.find(m => m.id === modelId)
          const configId = (baseTime + i).toString()
          
          // 生成配置名称：如果只有一个模型，使用原名称；多个模型时添加模型名称后缀
          const baseConfigName = selectedModels.length === 1 
            ? baseName 
            : `${baseName} - ${model?.name || modelId}`
          
          // 检查名称冲突并生成唯一名称
          const uniqueName = generateUniqueConfigName(baseConfigName, [...aiConfigs, ...createdConfigs])
          
          const aiConfig = createAIServiceConfig(
            {
              name: uniqueName,
              provider: newConfig.provider as any,
              apiKey: newConfig.apiKey,
              model: modelId,
              baseUrl: newConfig.baseUrl || template.baseUrl,
              isEnabled: true
            },
            configId
          )
          
          createdConfigs.push(aiConfig)
          onAddConfig(aiConfig)
        }
        
        showConfigAddSuccess(`批量添加了 ${selectedModels.length} 个配置`)
      } else {
        // 单个配置创建（原有逻辑）- 检查名称冲突
        const configId = Date.now().toString()
        const uniqueName = generateUniqueConfigName(newConfig.name, aiConfigs)
        
        const aiConfig = createAIServiceConfig(
          {
            name: uniqueName,
            provider: newConfig.provider as any,
            apiKey: newConfig.apiKey,
            model: newConfig.model || template.defaultModel,
            baseUrl: newConfig.baseUrl || template.baseUrl,
            isEnabled: true
          },
          configId
        )
        
        onAddConfig(aiConfig)
        
        if (uniqueName !== newConfig.name) {
          showConfigAddSuccess(`配置添加成功，名称已调整为: ${uniqueName}`)
        } else {
          showConfigAddSuccess(newConfig.name)
        }
      }
      
      // 重置状态
      setShowAddConfig(false)
      setNewConfig(DEFAULT_NEW_CONFIG)
      setIsTestPassed(false)
      setSelectedModels([])
      setIsMultiSelect(false)
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

  const handleSwitchConfig = async (configId: string) => {
    const config = aiConfigs.find((c) => c.id === configId)
    try {
      await onSwitchConfig(configId)
      if (config) {
        showConfigSwitchSuccess(config.name)
      }
    } catch (error) {
      console.error('Failed to switch config:', error)
      // 不显示错误toast，因为useSettings会处理错误
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

  // 多选模式相关函数
  const toggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect)
    // 切换模式时清空已选择的模型
    setSelectedModels([])
    // 如果切换到单选模式，保持当前选中的模型
    if (isMultiSelect && selectedModels.length > 0) {
      setNewConfig((prev) => ({ ...prev, model: selectedModels[0] }))
    }
  }

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId)
      } else {
        return [...prev, modelId]
      }
    })
  }

  const clearSelectedModels = () => {
    setSelectedModels([])
  }

  const removeSelectedModel = (modelId: string) => {
    setSelectedModels((prev) => prev.filter((id) => id !== modelId))
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
    onUpdateConfig,
    // 多选相关
    isMultiSelect,
    selectedModels,
    toggleMultiSelect,
    toggleModelSelection,
    clearSelectedModels,
    removeSelectedModel
  }
}
