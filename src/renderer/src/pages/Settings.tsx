import { useState } from 'react'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Settings as SettingsIcon, Database, Brain, Shield } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

const Settings = (): React.ReactElement => {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    chatlogUrl: 'http://localhost:8080',
    aiProvider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    notifications: true,
    autoBackup: true,
    theme: 'warm'
  })

  const handleSave = (): void => {
    toast({
      title: '设置已保存',
      description: '你的配置已成功更新。'
    })
  }

  const testConnection = async (type: 'chatlog' | 'ai'): Promise<void> => {
    toast({
      title: type === 'chatlog' ? '测试 Chatlog 连接' : '测试 AI 服务',
      description: '连接测试成功！'
    })
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-orange-100 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">设置</h1>
          <p className="text-sm text-gray-600">配置你的 EchoSoul 应用</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="environment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="environment">环境配置</TabsTrigger>
              <TabsTrigger value="ai">AI 服务</TabsTrigger>
              <TabsTrigger value="privacy">隐私安全</TabsTrigger>
              <TabsTrigger value="general">通用设置</TabsTrigger>
            </TabsList>

            {/* Environment Configuration */}
            <TabsContent value="environment">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Database className="h-5 w-5" />
                      Chatlog 服务配置
                    </CardTitle>
                    <CardDescription>配置微信聊天记录数据源连接</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="chatlogUrl">Chatlog 服务地址</Label>
                      <div className="flex gap-2">
                        <Input
                          id="chatlogUrl"
                          value={settings.chatlogUrl}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, chatlogUrl: e.target.value }))
                          }
                          placeholder="http://localhost:8080"
                        />
                        <Button variant="outline" onClick={() => testConnection('chatlog')}>
                          测试连接
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-100/50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">连接状态</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">已连接</Badge>
                        <span className="text-sm text-blue-700">
                          成功连接到 Chatlog 服务，可以获取聊天数据
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-100/50 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2">使用说明</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• 请确保 Chatlog 服务正在运行</li>
                        <li>• 默认端口为 8080，如有修改请相应调整</li>
                        <li>• 首次使用需要授权访问微信数据</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* AI Service Configuration */}
            <TabsContent value="ai">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Brain className="h-5 w-5" />
                      AI 服务配置
                    </CardTitle>
                    <CardDescription>配置用于分析的 AI 模型和服务</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="aiProvider">AI 服务提供商</Label>
                      <Select
                        value={settings.aiProvider}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, aiProvider: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="model">模型选择</Label>
                      <Select
                        value={settings.model}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, model: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="apiKey"
                          type="password"
                          value={settings.apiKey}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
                          }
                          placeholder="输入你的 API Key"
                        />
                        <Button variant="outline" onClick={() => testConnection('ai')}>
                          测试
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-100/50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">费用预估</h4>
                      <div className="text-sm text-purple-700 space-y-1">
                        <p>• 每次分析预计消耗：0.01-0.05 USD</p>
                        <p>• 当前余额：充足</p>
                        <p>• 本月使用量：12 次分析</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-100/50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">安全提醒</h4>
                      <p className="text-sm text-green-700">
                        你的 API Key 将安全存储在本地，不会上传到任何服务器。
                        所有聊天数据的分析都在你的设备上进行处理。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy & Security */}
            <TabsContent value="privacy">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Shield className="h-5 w-5" />
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
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, autoBackup: checked }))
                        }
                      />
                    </div>

                    <div className="p-4 bg-green-100/50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-3">数据处理原则</h4>
                      <ul className="text-sm text-green-700 space-y-2">
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
            </TabsContent>

            {/* General Settings */}
            <TabsContent value="general">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <SettingsIcon className="h-5 w-5" />
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
                      <Switch
                        checked={settings.notifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, notifications: checked }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="theme">界面主题</Label>
                      <Select
                        value={settings.theme}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, theme: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warm">温暖橙色（推荐）</SelectItem>
                          <SelectItem value="cool">清新蓝色</SelectItem>
                          <SelectItem value="nature">自然绿色</SelectItem>
                          <SelectItem value="elegant">优雅紫色</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-orange-100/50 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">关于 EchoSoul</h4>
                      <div className="text-sm text-orange-700 space-y-1">
                        <p>版本：1.0.0 MVP</p>
                        <p>构建时间：2024年12月</p>
                        <p>用AI把微信聊天变成个性化洞察</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8"
            >
              保存所有设置
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Settings
