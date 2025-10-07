import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup
} from '@/components/ui/command'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  // 多选相关props
  isMultiSelect?: boolean
  selectedModels?: string[]
  onToggleMultiSelect?: () => void
  onToggleModelSelection?: (modelId: string) => void
  onClearSelectedModels?: () => void
  onRemoveSelectedModel?: (modelId: string) => void
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
  availableModels = [],
  // 多选相关props
  isMultiSelect = false,
  selectedModels = [],
  onToggleMultiSelect,
  onToggleModelSelection,
  onClearSelectedModels,
  onRemoveSelectedModel
}) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isModelPopoverOpen, setIsModelPopoverOpen] = useState(false)
  const currentTemplate = PROVIDER_TEMPLATES[newConfig.provider]

  // 过滤模型列表 - 使用useMemo优化性能，避免每次渲染都重新计算
  const filteredModels = useMemo(() => {
    if (!modelSearchQuery) return availableModels
    return availableModels.filter(
      (model) =>
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
    )
  }, [availableModels, modelSearchQuery])

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

        {/* 模型选择模式切换 */}
        {availableModels.length > 1 && (
          <div className="flex justify-between items-center p-3 space-x-2 rounded-lg bg-muted/50">
            <div className="flex items-center space-x-2">
              <Label htmlFor="multi-select-mode" className="text-sm font-medium">
                批量创建模式
              </Label>
              <span className="text-xs text-muted-foreground">
                {isMultiSelect ? '选择多个模型批量创建配置' : '单个模型创建配置'}
              </span>
            </div>
            <Switch
              id="multi-select-mode"
              checked={isMultiSelect}
              onCheckedChange={onToggleMultiSelect}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-4 items-center">
            <Label htmlFor="model" className="w-20 text-right">
              模型
            </Label>
            {availableModels.length > 0 ? (
              <Popover open={isModelPopoverOpen} onOpenChange={setIsModelPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isModelPopoverOpen}
                    className="flex-1 justify-between"
                  >
                    {isMultiSelect
                      ? '选择模型...'
                      : newConfig.model
                        ? availableModels.find((model) => model.id === newConfig.model)?.name
                        : `选择模型（默认：${currentTemplate?.defaultModel}）`}
                    <ChevronsUpDown className="ml-2 w-4 h-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="搜索模型..."
                      value={modelSearchQuery}
                      onValueChange={setModelSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>未找到匹配的模型</CommandEmpty>
                      <CommandGroup>
                        {filteredModels.map((model) => (
                          <CommandItem
                            key={`model-${model.id}`}
                            value={model.name}
                            onSelect={() => {
                              if (isMultiSelect) {
                                onToggleModelSelection?.(model.id)
                              } else {
                                onConfigChange('model', model.id)
                                setIsModelPopoverOpen(false)
                                setModelSearchQuery('')
                              }
                            }}
                          >
                            {isMultiSelect ? (
                              <Checkbox
                                checked={selectedModels.includes(model.id)}
                                className="mr-2"
                              />
                            ) : (
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  newConfig.model === model.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            )}
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                              {model.contextLength && (
                                <div className="text-xs text-muted-foreground">
                                  上下文长度: {model.contextLength.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

          {/* 已选择模型标签显示 */}
          {isMultiSelect && selectedModels.length > 0 && (
            <div className="ml-24 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">
                  已选择的模型 ({selectedModels.length})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelectedModels}
                  className="px-2 h-6 text-xs"
                >
                  清空
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedModels.map((modelId) => {
                  const model = availableModels.find((m) => m.id === modelId)
                  return (
                    <Badge
                      key={modelId}
                      variant="secondary"
                      className="flex gap-1 items-center pr-1"
                    >
                      <span>{model?.name || modelId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSelectedModel?.(modelId)}
                        className="p-0 w-4 h-4 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>
            </div>
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
          <Button
            onClick={onAdd}
            className="flex-1"
            disabled={isLoading || !isTestPassed || (isMultiSelect && selectedModels.length === 0)}
          >
            {isLoading
              ? isMultiSelect && selectedModels.length > 1
                ? `创建中... (${selectedModels.length}个配置)`
                : '添加中...'
              : isMultiSelect && selectedModels.length > 0
                ? `批量创建 (${selectedModels.length}个配置)`
                : '添加'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
