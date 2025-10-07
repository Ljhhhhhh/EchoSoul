import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Brain } from 'lucide-react'
import { AIServiceConfig, SimpleAiConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'
import { useAiConfig } from '../hooks/useAiConfig'
import { AiConfigCard } from './AiConfigCard'
import { AddAiConfigForm } from './AddAiConfigForm'

interface AiServiceTabProps {
  currentAiConfig: string
  aiConfigs: AIServiceConfig[]
  onCurrentConfigChange: (configId: string) => void
  onAddConfig: (config: SimpleAiConfig) => void
  onRemoveConfig: (configId: string) => void
  onUpdateConfig: (configId: string, field: string, value: string | boolean) => void
  onTestConfig: (configId: string) => void
  onTestTempConfig?: (config: AIServiceConfig) => Promise<{
    success: boolean
    error?: string
    details?: any
  }>
}

export const AiServiceTab: React.FC<AiServiceTabProps> = ({
  currentAiConfig,
  aiConfigs,
  onCurrentConfigChange,
  onAddConfig,
  onRemoveConfig,
  onUpdateConfig,
  onTestConfig,
  onTestTempConfig
}) => {
  const {
    showAddConfig,
    setShowAddConfig,
    newConfig,
    isAddingConfig,
    handleProviderChange,
    handleAddConfig,
    handleRemoveConfig,
    handleSwitchConfig,
    handleTestConnection,
    handleTestConfig,
    updateNewConfig,
    isTestingConfig,
    isTestPassed,
    availableModels,
    // 多选相关状态和函数
    isMultiSelect,
    selectedModels,
    toggleMultiSelect,
    toggleModelSelection,
    clearSelectedModels,
    removeSelectedModel
  } = useAiConfig({
    onAddConfig,
    onRemoveConfig,
    onSwitchConfig: onCurrentConfigChange,
    onUpdateConfig,
    onTestConfig,
    onTestTempConfig,
    aiConfigs
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Brain className="w-5 h-5" />
            AI 服务配置
          </CardTitle>
          <CardDescription>自定义添加 AI 服务商配置，支持多模型管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {aiConfigs.length > 0 && (
            <div>
              <Label htmlFor="currentConfig">默认模型</Label>
              <Select value={currentAiConfig} onValueChange={handleSwitchConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="选择配置" />
                </SelectTrigger>
                <SelectContent>
                  {aiConfigs
                    .filter((config) => config.isEnabled)
                    .map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name} ({PROVIDER_TEMPLATES[config.provider]?.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h4 className="font-medium text-primary">AI 配置列表</h4>
            <Button onClick={() => setShowAddConfig(true)}>添加配置</Button>
          </div>

          {showAddConfig && (
            <AddAiConfigForm
              newConfig={newConfig}
              onConfigChange={updateNewConfig}
              onProviderChange={handleProviderChange}
              onAdd={handleAddConfig}
              onCancel={() => setShowAddConfig(false)}
              isLoading={isAddingConfig}
              onTest={handleTestConfig}
              isTestLoading={isTestingConfig}
              isTestPassed={isTestPassed}
              availableModels={availableModels}
              // 多选相关props
              isMultiSelect={isMultiSelect}
              selectedModels={selectedModels}
              onToggleMultiSelect={toggleMultiSelect}
              onToggleModelSelection={toggleModelSelection}
              onClearSelectedModels={clearSelectedModels}
              onRemoveSelectedModel={removeSelectedModel}
            />
          )}

          <div className="space-y-4">
            {aiConfigs.map((config) => (
              <AiConfigCard
                key={config.id}
                config={config}
                onUpdate={onUpdateConfig}
                onRemove={handleRemoveConfig}
                onTest={handleTestConnection}
              />
            ))}

            {aiConfigs.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>暂无 AI 配置</p>
                <p className="text-sm">点击&ldquo;添加配置&rdquo;按钮开始添加</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h4 className="mb-2 font-medium text-foreground">安全提醒</h4>
            <p className="text-sm text-muted-foreground">
              所有 API Key 将安全存储在本地，不会上传到任何服务器。
              所有聊天数据的分析都在你的设备上进行处理。
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
