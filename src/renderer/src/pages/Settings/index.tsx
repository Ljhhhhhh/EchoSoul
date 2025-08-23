import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from './hooks/useSettings'
import { useToastNotifications } from './hooks/useToastNotifications'
import { EnvironmentTab } from './components/EnvironmentTab'
import { AiServiceTab } from './components/AiServiceTab'
import { PrivacyTab } from './components/PrivacyTab'
import { GeneralTab } from './components/GeneralTab'
import { PromptManagementTab } from './components/PromptManagementTab'

const Settings = (): React.ReactElement => {
  const {
    settings,
    updateChatlogWorkDir,
    updateCurrentAiConfig,
    updateNotifications,
    updateAutoBackup,
    updateTheme,
    addAiConfig,
    removeAiConfig,
    updateAiConfig,
    testAiConfig,
    testTempAiConfig,
    addPromptTemplate,
    updatePromptTemplate,
    removePromptTemplate
  } = useSettings()

  const { showSaveSuccess } = useToastNotifications()

  const handleSave = (): void => {
    showSaveSuccess()
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">设置</h1>
          <p className="text-sm text-gray-600">配置你的 EchoSoul 应用</p>
        </div>
      </header>

      <main className="overflow-auto flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <Tabs defaultValue="environment" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="environment">环境配置</TabsTrigger>
              <TabsTrigger value="ai">AI 服务</TabsTrigger>
              <TabsTrigger value="prompts">提示词管理</TabsTrigger>
              <TabsTrigger value="privacy">隐私安全</TabsTrigger>
              <TabsTrigger value="general">通用设置</TabsTrigger>
            </TabsList>

            <TabsContent value="environment">
              <EnvironmentTab
                chatlogWorkDir={settings.chatlogWorkDir}
                onChatlogWorkDirChange={updateChatlogWorkDir}
              />
            </TabsContent>

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

            <TabsContent value="privacy">
              <PrivacyTab autoBackup={settings.autoBackup} onAutoBackupChange={updateAutoBackup} />
            </TabsContent>

            <TabsContent value="general">
              <GeneralTab
                notifications={settings.notifications}
                theme={settings.theme}
                onNotificationsChange={updateNotifications}
                onThemeChange={updateTheme}
              />
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
              className="px-8 text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
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
