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
import { AiConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'
import { useAiConfig } from '../hooks/useAiConfig'
import { AiConfigCard } from './AiConfigCard'
import { AddAiConfigForm } from './AddAiConfigForm'

interface AiServiceTabProps {
  currentAiConfig: string
  aiConfigs: AiConfig[]
  onCurrentConfigChange: (configId: string) => void
  onAddConfig: (config: AiConfig) => void
  onRemoveConfig: (configId: string) => void
  onUpdateConfig: (configId: string, field: string, value: string | boolean) => void
}

export const AiServiceTab: React.FC<AiServiceTabProps> = ({
  currentAiConfig,
  aiConfigs,
  onCurrentConfigChange,
  onAddConfig,
  onRemoveConfig,
  onUpdateConfig
}) => {
  const {
    showAddConfig,
    setShowAddConfig,
    newConfig,
    handleProviderChange,
    handleAddConfig,
    handleRemoveConfig,
    handleSwitchConfig,
    handleTestConnection,
    updateNewConfig
  } = useAiConfig({
    onAddConfig,
    onRemoveConfig,
    onSwitchConfig: onCurrentConfigChange,
    onUpdateConfig,
    aiConfigs
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
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
                    .filter((config) => config.enabled)
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
            <h4 className="font-medium text-purple-800">AI 配置列表</h4>
            <Button
              onClick={() => setShowAddConfig(true)}
              className="text-white bg-purple-600 hover:bg-purple-700"
            >
              添加配置
            </Button>
          </div>

          {showAddConfig && (
            <AddAiConfigForm
              newConfig={newConfig}
              onConfigChange={updateNewConfig}
              onProviderChange={handleProviderChange}
              onAdd={handleAddConfig}
              onCancel={() => setShowAddConfig(false)}
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
              <div className="py-8 text-center text-gray-500">
                <p>暂无 AI 配置</p>
                <p className="text-sm">点击&ldquo;添加配置&rdquo;按钮开始添加</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-purple-100/50">
            <h4 className="mb-2 font-medium text-purple-800">使用说明</h4>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• 可以为同一个服务商添加多个不同的配置（不同模型、不同环境等）</li>
              <li>• 通过顶部下拉框快速切换当前使用的配置</li>
              <li>• 只有启用的配置才能被选择使用</li>
              <li>• 支持自定义服务商，可配置任意兼容 OpenAI API 的服务</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-green-100/50">
            <h4 className="mb-2 font-medium text-green-800">安全提醒</h4>
            <p className="text-sm text-green-700">
              所有 API Key 将安全存储在本地，不会上传到任何服务器。
              所有聊天数据的分析都在你的设备上进行处理。
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
