/**
 * 重构后的生成报告主页面
 */
import React from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { TimeRangeSelector } from './components/TimeRangeSelector'
import { PromptSelector } from './components/PromptSelector'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useContacts } from './hooks/useContacts'
import { usePrompts } from './hooks/usePrompts'
import { useFormState } from './hooks/useFormState'
import { useAiServices } from './hooks/useAiServices'
import { ContactSelector } from './components/ContactSelector'
import { AIServiceSelector } from './components/AIServiceSelector'

const GenerateReport: React.FC = () => {
  // 使用自定义Hooks管理状态
  const contactsData = useContacts()
  const promptsData = usePrompts()
  const aiServicesData = useAiServices()
  const formState = useFormState(
    contactsData.personalContacts,
    contactsData.chatRooms,
    aiServicesData.aiServices
  )

  // Prompt选择值（支持自定义）
  const [promptSelection, setPromptSelection] = React.useState<string>('')

  // 当AI服务加载完成且没有选中服务时，自动选择默认服务
  React.useEffect(() => {
    if (
      !aiServicesData.loading &&
      !formState.formData.selectedAiService &&
      aiServicesData.aiServices.length > 0
    ) {
      const defaultServiceId = aiServicesData.getDefaultServiceId()
      if (defaultServiceId) {
        formState.updateField('selectedAiService', defaultServiceId)
      }
    }
  }, [
    aiServicesData.loading,
    aiServicesData.aiServices,
    formState.formData.selectedAiService,
    aiServicesData,
    formState
  ])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 提交表单
    await formState.submitForm()
  }

  // 处理Prompt选择
  const handlePromptSelect = (promptId: string) => {
    setPromptSelection(promptId)
    if (promptId === '__custom__') {
      // 选择自定义，清空已选模板，启用自定义输入
      promptsData.selectPrompt(null)
      formState.updateField('analysisType', null)
      return
    }

    promptsData.selectPromptById(promptId)
    const selectedPrompt = promptsData.prompts.find((p) => p.id === promptId)
    if (selectedPrompt) {
      formState.updateField('analysisType', {
        id: selectedPrompt.id,
        name: selectedPrompt.name,
        content: selectedPrompt.content
      })
    }
  }

  return (
    <div className="flex bg-background">
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-foreground">生成分析报告</h1>
              <p className="text-muted-foreground">配置你的个性化聊天分析</p>
            </div>
          </div>

          {/* 快速选择区域已移除 */}

          {/* 主要配置区域 */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-foreground">分析配置</CardTitle>
                <CardDescription>配置你的聊天记录分析参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 时间范围选择 */}
                  <TimeRangeSelector
                    timeRange={formState.formData.timeRange}
                    customStartDate={formState.formData.customStartDate}
                    customEndDate={formState.formData.customEndDate}
                    timeRanges={formState.timeRanges}
                    onTimeRangeChange={(value) => formState.updateField('timeRange', value)}
                    onStartDateChange={(value) => formState.updateField('customStartDate', value)}
                    onEndDateChange={(value) => formState.updateField('customEndDate', value)}
                  />

                  {/* 联系人选择 */}
                  <ContactSelector
                    personalContacts={contactsData.personalContacts}
                    chatRooms={contactsData.chatRooms}
                    initSelectedContacts={formState.formData.selectedContacts}
                    onSelectedContactsUpdate={(value, contactName) => {
                      formState.updateField('selectedContacts', value)
                      formState.updateField('selectedContactName', contactName)
                    }}
                  />

                  {/* AI模型选择 */}
                  <AIServiceSelector
                    aiServices={aiServicesData.aiServices}
                    selectedServiceId={formState.formData.selectedAiService}
                    onServiceSelect={(value) => formState.updateField('selectedAiService', value)}
                    disabled={formState.isGenerating}
                  />

                  {/* Prompt选择 */}
                  <PromptSelector
                    prompts={promptsData.prompts}
                    selectedPrompt={promptsData.selectedPrompt}
                    selectedValue={promptSelection}
                    onPromptSelect={handlePromptSelect}
                    enableCustom
                    isCustomSelected={promptSelection === '__custom__'}
                    customPrompt={formState.formData.customPrompt}
                    onCustomPromptChange={(v) => formState.updateField('customPrompt', v)}
                  />

                  {/* 生成按钮 */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={formState.isGenerating || !formState.isFormValid}
                      className="w-full h-12 shadow-lg"
                      onClick={handleSubmit}
                    >
                      {formState.isGenerating ? (
                        <>
                          <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                          正在生成报告...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          生成分析报告
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GenerateReport
