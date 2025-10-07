/**
 * 配置预览组件
 */
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, Wand2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import type { DataStats, TimeRange, PromptTemplate } from '../../types'

interface ConfigPreviewProps {
  timeRange: string
  timeRanges: TimeRange[]
  selectedContacts: string | null
  targetType: string
  selectedPrompt: PromptTemplate | null
  dataStats: DataStats
  isGenerating: boolean
  isFormValid: boolean
  onSubmit: (e?: React.FormEvent) => void
}

export const ConfigPreview: React.FC<ConfigPreviewProps> = ({
  timeRange,
  timeRanges,
  selectedContacts,
  targetType,
  selectedPrompt,
  dataStats,
  isGenerating,
  isFormValid,
  onSubmit
}) => {
  const getTargetLabel = () => {
    if (!selectedContacts) return '未选择'
    if (targetType === 'all') return '全部聊天'
    if (targetType === 'groups') return '所有群聊'
    return '1 个联系人'
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">配置预览</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前配置摘要 */}
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">时间：</span>
              <span className="font-medium text-foreground">
                {timeRanges.find((t) => t.value === timeRange)?.label || '未选择'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">对象：</span>
              <span className="font-medium text-foreground">{getTargetLabel()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">模板：</span>
              <span className="font-medium text-foreground">
                {selectedPrompt?.name || '未选择'}
              </span>
            </div>
          </div>
        </div>

        {/* 数据统计预览 */}
        {timeRange && selectedContacts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 border border-primary/20 rounded-lg bg-primary/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="text-sm font-medium text-primary">预计数据量</div>
            </div>
            <div className="mb-1 text-2xl font-bold text-foreground">
              {dataStats.messageCount.toLocaleString()} 条消息
            </div>
            <div className="text-sm text-muted-foreground">
              覆盖 {dataStats.daysCovered} 天，{dataStats.contactsInvolved} 个联系人
            </div>
          </motion.div>
        )}

        {/* 生成按钮 */}
        <Button
          type="submit"
          disabled={isGenerating || !isFormValid}
          className="w-full h-12 shadow-lg"
          onClick={onSubmit}
        >
          {isGenerating ? (
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
      </CardContent>
    </Card>
  )
}
