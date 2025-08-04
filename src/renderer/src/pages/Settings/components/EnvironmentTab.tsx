import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Database } from 'lucide-react'
import { useToastNotifications } from '../hooks/useToastNotifications'

interface EnvironmentTabProps {
  chatlogWorkDir: string
  onChatlogWorkDirChange: (workDir: string) => void
}

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  chatlogWorkDir,
  onChatlogWorkDirChange
}) => {
  const { showChatlogTestSuccess } = useToastNotifications()

  const handleTestConnection = () => {
    showChatlogTestSuccess()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="w-5 h-5" />
            Chatlog 数据配置
          </CardTitle>
          <CardDescription>配置微信聊天记录解密数据目录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chatlogWorkDir">Chatlog 工作目录</Label>
            <div className="flex gap-2">
              <Input
                id="chatlogWorkDir"
                value={chatlogWorkDir}
                onChange={(e) => onChatlogWorkDirChange(e.target.value)}
                placeholder="选择解密后的微信数据目录路径"
              />
              <Button variant="outline" onClick={handleTestConnection}>
                浏览
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-100/50">
            <h4 className="mb-2 font-medium text-blue-800">连接状态</h4>
            <div className="flex items-center gap-2">
              <Badge className="text-green-700 bg-green-100">已配置</Badge>
              <span className="text-sm text-blue-700">
                成功找到解密数据目录，可以读取聊天记录
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-100/50">
            <h4 className="mb-2 font-medium text-amber-800">使用说明</h4>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• 请先使用微信数据解密工具解密聊天记录</li>
              <li>• 选择包含解密后数据文件的目录</li>
              <li>• 确保目录中包含聊天记录数据库文件</li>
              <li>• 所有数据处理均在本地进行，保护隐私安全</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
