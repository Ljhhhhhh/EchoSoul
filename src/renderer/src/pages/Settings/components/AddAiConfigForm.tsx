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
import { NewAiConfig } from '../types'
import { PROVIDER_TEMPLATES } from '../constants'

interface AddAiConfigFormProps {
  newConfig: NewAiConfig
  onConfigChange: (field: keyof NewAiConfig, value: string) => void
  onProviderChange: (provider: string) => void
  onAdd: () => void
  onCancel: () => void
}

export const AddAiConfigForm: React.FC<AddAiConfigFormProps> = ({
  newConfig,
  onConfigChange,
  onProviderChange,
  onAdd,
  onCancel
}) => {
  const currentTemplate = PROVIDER_TEMPLATES[newConfig.provider]

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">添加新的 AI 配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="configName">配置名称</Label>
          <Input
            id="configName"
            value={newConfig.name}
            onChange={(e) => onConfigChange('name', e.target.value)}
            placeholder="例如：GPT-4 生产环境"
          />
        </div>

        <div>
          <Label htmlFor="provider">服务商</Label>
          <Select value={newConfig.provider} onValueChange={onProviderChange}>
            <SelectTrigger>
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

        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={newConfig.apiKey}
            onChange={(e) => onConfigChange('apiKey', e.target.value)}
            placeholder="输入 API Key"
          />
        </div>

        <div>
          <Label htmlFor="model">模型</Label>
          <Input
            id="model"
            value={newConfig.model}
            onChange={(e) => onConfigChange('model', e.target.value)}
            placeholder={`默认：${currentTemplate?.defaultModel}`}
          />
        </div>

        {currentTemplate?.requiresBaseUrl && (
          <div>
            <Label htmlFor="baseUrl">API 地址</Label>
            <Input
              id="baseUrl"
              value={newConfig.baseUrl}
              onChange={(e) => onConfigChange('baseUrl', e.target.value)}
              placeholder={currentTemplate?.baseUrl}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onAdd} className="flex-1">
            添加
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
