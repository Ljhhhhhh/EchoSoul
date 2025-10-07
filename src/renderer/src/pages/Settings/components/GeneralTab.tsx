import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Settings as SettingsIcon } from 'lucide-react'
import { THEME_OPTIONS } from '../constants'

interface GeneralTabProps {
  notifications: boolean
  theme: string
  onNotificationsChange: (enabled: boolean) => void
  onThemeChange: (theme: string) => void
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  notifications,
  theme,
  onNotificationsChange,
  onThemeChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <SettingsIcon className="w-5 h-5" />
            通用设置
          </CardTitle>
          <CardDescription>个性化你的应用体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">桌面通知</Label>
              <p className="text-sm text-gray-600">报告生成完成时显示通知</p>
            </div>
            <Switch checked={notifications} onCheckedChange={onNotificationsChange} />
          </div>

          <div>
            <Label htmlFor="theme">界面主题</Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg bg-orange-100/50">
            <h4 className="mb-2 font-medium text-orange-800">关于 EchoSoul</h4>
            <div className="space-y-1 text-sm text-orange-700">
              <p>版本：1.0.0 MVP</p>
              <p>构建时间：2024年12月</p>
              <p>用AI把微信聊天变成个性化洞察</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
