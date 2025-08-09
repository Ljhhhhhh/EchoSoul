/**
 * 重构后的生成报告主页面
 */
import React from 'react'
import { SidebarTrigger } from '../../components/ui/sidebar'
import { QuickSelectSection } from './components/QuickSelectSection'
import { TimeRangeSelector } from './components/TimeRangeSelector'
import { PromptSelector } from './components/PromptSelector'
import { ConfigPreview } from './components/ConfigPreview'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { useContacts } from './hooks/useContacts'
import { useConditions } from './hooks/useConditions'
import { usePrompts } from './hooks/usePrompts'
import { useFormState } from './hooks/useFormState'
import { useContactSearch } from './hooks/useContactSearch'
import { ContactSelector } from './components/ContactSelector'

const GenerateReport: React.FC = () => {
  // 使用自定义Hooks管理状态
  const contactsData = useContacts()
  const promptsData = usePrompts()
  const formState = useFormState(contactsData.personalContacts, contactsData.groupChats)
  const conditionsData = useConditions()
  const contactSearch = useContactSearch({
    searchableContacts: contactsData.searchableContacts
  })

  // 应用保存的条件
  const handleApplyCondition = (condition: any) => {
    formState.updateFormData({
      timeRange: condition.timeRange,
      customStartDate: condition.customStartDate,
      customEndDate: condition.customEndDate,
      targetType: condition.targetType,
      selectedContacts: condition.selectedContacts,
      analysisType: condition.analysisType,
      customPrompt: condition.customPrompt
    })

    // 同步选择的Prompt
    promptsData.selectPromptById(condition.analysisType)

    conditionsData.applyCondition(condition, () => {
      // 显示成功提示逻辑可以在这里处理
    })
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    formState.updateField('analysisType', promptId)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center gap-4 mb-6">
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
          <div className="grid grid-cols-3 gap-8">
            {/* 左侧：配置区域 */}
            <div className="col-span-2">
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
                      groupChats={contactsData.groupChats}
                      selectedContacts={formState.formData.selectedContacts}
                      searchTerm={contactSearch.searchTerm}
                      isPopoverOpen={contactSearch.isPopoverOpen}
                      targetType={formState.formData.targetType as 'individual' | 'group'}
                      onSearchChange={contactSearch.updateSearchTerm}
                      onTogglePopover={contactSearch.togglePopover}
                      onAddContact={formState.addContact}
                      onRemoveContact={formState.removeContact}
                      onClearAll={formState.clearAllContacts}
                      onTargetTypeChange={(type) => {
                        formState.updateField('targetType', type)
                        // 切换类型时清空已选联系人，避免混合选择
                        formState.clearAllContacts()
                      }}
                    />

                    {/* Prompt选择 */}
                    <PromptSelector
                      prompts={promptsData.prompts}
                      selectedPrompt={promptsData.selectedPrompt}
                      onPromptSelect={handlePromptSelect}
                    />
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：预览和操作区域 */}
            <div className="space-y-4">
              <ConfigPreview
                timeRange={formState.formData.timeRange}
                timeRanges={formState.timeRanges}
                selectedContacts={formState.formData.selectedContacts}
                targetType={formState.formData.targetType}
                selectedPrompt={promptsData.selectedPrompt}
                dataStats={formState.dataStats}
                isGenerating={formState.isGenerating}
                isFormValid={formState.isFormValid}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GenerateReport
