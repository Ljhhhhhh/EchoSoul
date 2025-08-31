/**
 * AI服务选择器组件
 */
import React from 'react'
import { ChevronDown, Cpu, Zap } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { AIServiceConfig } from '@types'

interface AIServiceSelectorProps {
  aiServices: AIServiceConfig[]
  selectedServiceId: string | null
  onServiceSelect: (serviceId: string) => void
  disabled?: boolean
}

export const AIServiceSelector: React.FC<AIServiceSelectorProps> = ({
  aiServices,
  selectedServiceId,
  onServiceSelect,
  disabled = false
}) => {
  // 过滤出启用的AI服务
  const enabledServices = aiServices.filter((service) => service.isEnabled)

  // 获取选中的服务
  const selectedService = enabledServices.find((service) => service.id === selectedServiceId)

  // 获取提供商图标
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <Zap className="w-4 h-4" />
      case 'anthropic':
        return <Cpu className="w-4 h-4" />
      case 'gemini':
        return <Cpu className="w-4 h-4" />
      case 'siliconflow':
        return <Cpu className="w-4 h-4" />
      case 'moonshot':
        return <Cpu className="w-4 h-4" />
      case 'local':
        return <Cpu className="w-4 h-4" />
      case 'deepseek':
        return <Cpu className="w-4 h-4" />
      case 'openrouter':
        return <Cpu className="w-4 h-4" />
      default:
        return <Cpu className="w-4 h-4" />
    }
  }

  // 获取提供商颜色 - 使用主题颜色
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-primary/10 text-primary'
      case 'anthropic':
        return 'bg-secondary/50 text-secondary-foreground'
      case 'gemini':
        return 'bg-accent/50 text-accent-foreground'
      case 'deepseek':
        return 'bg-muted text-muted-foreground'
      case 'siliconflow':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      case 'moonshot':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
      case 'local':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      case 'openrouter':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (enabledServices.length === 0) {
    return (
      <div className="p-4 text-center rounded-lg border border-border border-dashed">
        <Cpu className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">暂无可用的AI服务</p>
        <p className="mt-1 text-xs text-muted-foreground">请先在设置中配置AI服务</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">选择AI模型</label>

      <Select value={selectedServiceId || ''} onValueChange={onServiceSelect} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择AI模型">
            {selectedService && (
              <div className="flex gap-2 items-center">
                {getProviderIcon(selectedService.provider)}
                <span>{selectedService.name}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getProviderColor(selectedService.provider)}`}
                >
                  {selectedService.model}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {enabledServices.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              <div className="flex gap-2 items-center w-full">
                {getProviderIcon(service.provider)}
                <div className="flex-1">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-xs text-muted-foreground">{service.description}</div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getProviderColor(service.provider)}`}
                >
                  {service.model}
                </Badge>
                {service.isPrimary && (
                  <Badge variant="default" className="text-xs">
                    默认
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedService && (
        <div className="text-xs text-muted-foreground">
          提供商: {selectedService.provider} | 模型: {selectedService.model}
        </div>
      )}
    </div>
  )
}
