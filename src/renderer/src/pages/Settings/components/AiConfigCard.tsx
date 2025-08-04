import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AiConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'

interface AiConfigCardProps {
  config: AiConfig
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
      className={`border ${config.enabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{config.name}</CardTitle>
            <p className="text-sm text-gray-600">
              {template?.name} - {config.model}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.enabled ? 'default' : 'secondary'}>
              {config.enabled ? '已启用' : '已禁用'}
            </Badge>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => onUpdate(config.id, 'enabled', checked)}
            />
            <Button variant="destructive" size="sm" onClick={() => onRemove(config.id)}>
              删除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor={`${config.id}-apiKey`}>API Key</Label>
          <div className="flex gap-2">
            <Input
              id={`${config.id}-apiKey`}
              type="password"
              value={config.apiKey}
              onChange={(e) => onUpdate(config.id, 'apiKey', e.target.value)}
              placeholder="输入 API Key"
              disabled={!config.enabled}
            />
            <Button
              variant="outline"
              onClick={() => onTest(config.id)}
              disabled={!config.enabled || !config.apiKey}
            >
              测试
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor={`${config.id}-model`}>模型</Label>
          <Input
            id={`${config.id}-model`}
            value={config.model}
            onChange={(e) => onUpdate(config.id, 'model', e.target.value)}
            placeholder="模型名称"
            disabled={!config.enabled}
          />
        </div>

        {template?.requiresBaseUrl && (
          <div>
            <Label htmlFor={`${config.id}-baseUrl`}>API 地址</Label>
            <Input
              id={`${config.id}-baseUrl`}
              value={config.baseUrl}
              onChange={(e) => onUpdate(config.id, 'baseUrl', e.target.value)}
              placeholder="API 基础地址"
              disabled={!config.enabled}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
