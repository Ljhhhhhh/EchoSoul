import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Eye, EyeOff } from 'lucide-react'
import { SimpleAiConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'

interface AddAiConfigFormProps {
  newConfig: SimpleAiConfig
  onConfigChange: (field: keyof SimpleAiConfig, value: string) => void
  onProviderChange: (provider: string) => void
  onAdd: () => void
  onCancel: () => void
  isLoading?: boolean
  onTest?: () => void
  isTestLoading?: boolean
  isTestPassed?: boolean
  availableModels?: Array<{
    id: string
    name: string
    contextLength?: number
    pricing?: { prompt: number; completion: number }
  }>
}

export const AddAiConfigForm: React.FC<AddAiConfigFormProps> = ({
  newConfig,
  onConfigChange,
  onProviderChange,
  onAdd,
  onCancel,
  isLoading = false,
  onTest,
  isTestLoading = false,
  isTestPassed = false,
  availableModels = []
}) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const currentTemplate = PROVIDER_TEMPLATES[newConfig.provider]

  // 过滤模型列表
  const filteredModels = availableModels.filter(
    (model) =>
      model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
  )

  return (
    <Card className="border-primary/20 bg-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">添加新的 AI 配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <Label htmlFor="configName" className="w-20 text-right">
            配置名称
          </Label>
          <Input
            id="configName"
            value={newConfig.name}
            onChange={(e) => onConfigChange('name', e.target.value)}
            placeholder="例如：GPT-4 生产环境"
            className="flex-1"
          />
        </div>

        <div className="flex gap-4 items-center">
          <Label htmlFor="provider" className="w-20 text-right">
            服务商
          </Label>
          <Select value={newConfig.provider} onValueChange={onProviderChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 items-center">
          <Label htmlFor="apiKey" className="w-20 text-right">
            API Key
          </Label>
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showPassword ? 'text' : 'password'}
                value={newConfig.apiKey}
                onChange={(e) => onConfigChange('apiKey', e.target.value)}
                placeholder="输入 API Key"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex absolute right-2 top-1/2 justify-center items-center w-8 h-8 text-gray-500 rounded transition-colors -translate-y-1/2 hover:text-gray-700 hover:bg-gray-100"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Button
              type="button"
              variant={isTestPassed ? 'default' : 'outline'}
              onClick={onTest}
              disabled={!newConfig.provider || !newConfig.apiKey || isTestLoading || isLoading}
              className={isTestPassed ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isTestLoading ? '验证中...' : isTestPassed ? '已验证' : '验证'}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Label htmlFor="model" className="w-20 text-right">
            模型
          </Label>
          {availableModels.length > 0 ? (
            <Select
              value={newConfig.model}
              onValueChange={(value) => onConfigChange('model', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`选择模型（默认：${currentTemplate?.defaultModel}）`} />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b">
                  <Input
                    placeholder="搜索模型..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-60">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      未找到匹配的模型
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="model"
              value={newConfig.model}
              onChange={(e) => onConfigChange('model', e.target.value)}
              placeholder={`默认：${currentTemplate?.defaultModel}`}
              className="flex-1"
            />
          )}
        </div>

        {currentTemplate?.requiresBaseUrl && (
          <div className="flex gap-4 items-center">
            <Label htmlFor="baseUrl" className="w-20 text-right">
              API 地址
            </Label>
            <Input
              id="baseUrl"
              value={newConfig.baseUrl}
              onChange={(e) => onConfigChange('baseUrl', e.target.value)}
              placeholder={currentTemplate?.baseUrl}
              className="flex-1"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
            取消
          </Button>
          <Button onClick={onAdd} className="flex-1" disabled={isLoading || !isTestPassed}>
            {isLoading ? '添加中...' : '添加'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
