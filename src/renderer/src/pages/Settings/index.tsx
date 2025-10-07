import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useSettings } from './hooks/useSettings'
import { useToastNotifications } from './hooks/useToastNotifications'
import { useTheme } from '../../hooks/useTheme'
import { AiServiceTab } from './components/AiServiceTab'
import { PromptManagementTab } from './components/PromptManagementTab'
import { THEME_OPTIONS } from './constants'

const Settings = (): React.ReactElement => {
  const {
    settings,
    updateCurrentAiConfig,
    addAiConfig,
    removeAiConfig,
    updateAiConfig,
    testAiConfig,
    testTempAiConfig
  } = useSettings()

  const { theme, setTheme } = useTheme()
  const { showSaveSuccess } = useToastNotifications()

  const handleSave = (): void => {
    showSaveSuccess()
  }

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 border-b border-border backdrop-blur-sm bg-card/80">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">设置</h1>
          <p className="text-sm text-muted-foreground">配置你的 EchoSoul 应用</p>
        </div>
        <div className="ml-auto">
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择主题" />
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
      </header>

      <main className="overflow-auto flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ai">AI 服务</TabsTrigger>
              <TabsTrigger value="prompts">提示词管理</TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <AiServiceTab
                currentAiConfig={settings.currentAiConfig}
                aiConfigs={settings.aiConfigs}
                onCurrentConfigChange={updateCurrentAiConfig}
                onAddConfig={addAiConfig}
                onRemoveConfig={removeAiConfig}
                onUpdateConfig={updateAiConfig}
                onTestConfig={testAiConfig}
                onTestTempConfig={testTempAiConfig}
              />
            </TabsContent>

            <TabsContent value="prompts">
              <PromptManagementTab />
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <Button onClick={handleSave} className="px-8">
              保存所有设置
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Settings
