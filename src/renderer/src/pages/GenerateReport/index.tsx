/**
 * 重构后的生成报告主页面
 */
import React from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { QuickSelectSection } from './components/QuickSelectSection'
import { TimeRangeSelector } from './components/TimeRangeSelector'
import { PromptSelector } from './components/PromptSelector'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useContacts } from './hooks/useContacts'
import { useConditions } from './hooks/useConditions'
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
  const conditionsData = useConditions()

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
  }, [aiServicesData.loading, aiServicesData.aiServices, formState.formData.selectedAiService])

  // 应用保存的条件
  const handleApplyCondition = (condition: any) => {
    formState.updateFormData({
      timeRange: condition.timeRange,
      customStartDate: condition.customStartDate,
      customEndDate: condition.customEndDate,
      targetType: condition.targetType,
      // 将数组格式的联系人转换为单个联系人（取第一个）
      selectedContacts: Array.isArray(condition.selectedContacts)
        ? condition.selectedContacts[0] || null
        : condition.selectedContacts,
      analysisType: condition.analysisType,
      customPrompt: condition.customPrompt,
      selectedAiService: condition.selectedAiService || aiServicesData.getDefaultServiceId()
    })

    // 同步选择的Prompt
    const promptId = typeof condition.analysisType === 'object' 
      ? condition.analysisType?.id 
      : condition.analysisType
    if (promptId) {
      promptsData.selectPromptById(promptId)
    }

    conditionsData.applyCondition(condition, () => {
      // 显示成功提示逻辑可以在这里处理
    })
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: 打印当前条件，查看联系人相关配置是否正确
    console.log('当前条件:', formState.formData)

    // 保存当前条件
    conditionsData.saveCondition(
      formState.formData,
      formState.timeRanges,
      promptsData.selectedPrompt
    )

    // 提交表单
    await formState.submitForm()
  }

  // 处理Prompt选择
  const handlePromptSelect = (promptId: string) => {
    promptsData.selectPromptById(promptId)
    const selectedPrompt = promptsData.prompts.find(p => p.id === promptId)
    if (selectedPrompt) {
      formState.updateField('analysisType', {
        id: selectedPrompt.id,
        content: selectedPrompt.content
      })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="overflow-auto flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          {/* 页面标题 */}
          <div className="flex gap-4 items-center mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成分析报告</h1>
              <p className="text-gray-600">配置你的个性化聊天分析</p>
            </div>
          </div>

          {/* 快速选择区域 */}
          <QuickSelectSection
            conditions={conditionsData.sortedConditions}
            showConditions={conditionsData.showSavedConditions}
            onToggleDisplay={conditionsData.toggleDisplay}
            onApplyCondition={handleApplyCondition}
            onDeleteCondition={conditionsData.deleteCondition}
          />

          {/* 主要配置区域 */}
          <div className="mx-auto max-w-4xl">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-800">分析配置</CardTitle>
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
                    onSelectedContactsUpdate={(value) =>
                      formState.updateField('selectedContacts', value)
                    }
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
                    onPromptSelect={handlePromptSelect}
                  />

                  {/* 生成按钮 */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={formState.isGenerating || !formState.isFormValid}
                      className="w-full h-12 text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                      onClick={handleSubmit}
                    >
                      {formState.isGenerating ? (
                        <>
                          <Wand2 className="mr-2 w-4 h-4 animate-spin" />
                          正在生成报告...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-4 h-4" />
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
