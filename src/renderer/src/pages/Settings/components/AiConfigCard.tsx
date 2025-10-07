import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Brain, Trash2, TestTube, Power, PowerOff } from 'lucide-react'
import { AIServiceConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'

interface AiConfigCardProps {
  config: AIServiceConfig
  onUpdate: (configId: string, field: string, value: string | boolean) => void
  onRemove: (configId: string) => void
  onTest: (configId: string) => void
}

export const AiConfigCard: React.FC<AiConfigCardProps> = ({
  config,
  onUpdate,
  onRemove,
  onTest
}) => {
  const template = PROVIDER_TEMPLATES[config.provider]

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        config.isEnabled
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/30 shadow-sm'
          : 'border-gray-200 bg-gray-50/30'
      }`}
    >
      {/* 状态指示条 */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          config.isEnabled ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gray-300'
        }`}
      />

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          {/* 左侧信息区域 */}
          <div className="flex flex-1 gap-3 items-start">
            {/* 配置信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center mb-1">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {config.name}
                </CardTitle>
                <Badge
                  variant={config.isEnabled ? 'default' : 'secondary'}
                  className={`text-xs font-medium transition-colors ${
                    config.isEnabled
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {template?.name}
                </Badge>
              </div>
              <p className="mb-2 text-sm text-gray-600">
                模型: <span className="font-medium">{config.model}</span>
              </p>
            </div>
          </div>

          {/* 右侧操作区域 */}
          <div className="flex gap-2 items-center ml-4">
            {/* 删除按钮 */}
            <Button
              variant="ghost"
              onClick={() => onRemove(config.id)}
              className={`p-0 w-12 h-12 text-gray-400 opacity-0 transition-all duration-200 group-hover:opacity-100 ${
                config.isEnabled
                  ? 'hover:text-red-500 hover:bg-red-50/80'
                  : 'hover:text-red-500 hover:bg-red-50/60'
              }`}
            >
              <Trash2 className="w-10 h-10" />
            </Button>
            {/* 启用/禁用开关 */}
            <div className="flex flex-col gap-1 items-center">
              <Switch
                checked={config.isEnabled}
                onCheckedChange={(checked: boolean) => {
                  console.log('Switch changed:', checked, 'for config:', config.id)
                  onUpdate(config.id, 'isEnabled', checked)
                }}
                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
