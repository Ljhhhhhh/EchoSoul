import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Shield } from 'lucide-react'

interface PrivacyTabProps {
  autoBackup: boolean
  onAutoBackupChange: (enabled: boolean) => void
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ autoBackup, onAutoBackupChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            隐私与安全
          </CardTitle>
          <CardDescription>管理你的数据隐私和安全设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">自动备份报告</Label>
              <p className="text-sm text-gray-600">定期备份你的分析报告到本地</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={onAutoBackupChange} />
          </div>

          <div className="p-4 rounded-lg bg-green-100/50">
            <h4 className="mb-3 font-medium text-green-800">数据处理原则</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>✓ 所有聊天数据仅在本地处理，不上传到云端</li>
              <li>✓ API Key 使用系统级加密存储</li>
              <li>✓ 分析报告可选择性备份和导出</li>
              <li>✓ 支持一键清除所有本地数据</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              导出所有数据
            </Button>
            <Button variant="destructive" className="flex-1">
              清除所有数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
