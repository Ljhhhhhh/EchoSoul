/**
 * AI服务选择器组件
 */
import React from 'react'
import { Cpu, Zap } from 'lucide-react'
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

  if (enabledServices.length === 0) {
    return (
      <div className="p-4 text-center rounded-lg border border-dashed border-border">
        <Cpu className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">暂无可用的AI服务</p>
        <p className="mt-1 text-xs text-muted-foreground">请先在设置中配置AI服务</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-foreground">
          <Cpu className="w-5 h-5 text-primary" />
          选择模型
        </label>
        <Select value={selectedServiceId || ''} onValueChange={onServiceSelect} disabled={disabled}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="请选择模型">
              {selectedService && (
                <div className="flex gap-2 items-center">
                  <span>{selectedService.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {enabledServices.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-muted-foreground">{service.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
