/**
 * Prompt模板选择组件
 */
import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { PromptTemplate } from '@types'
import { Textarea } from '@/components/ui/textarea'

interface PromptSelectorProps {
  prompts: PromptTemplate[]
  selectedPrompt: PromptTemplate | null
  selectedValue: string
  onPromptSelect: (promptId: string) => void
  // 自定义提示词相关
  enableCustom?: boolean
  isCustomSelected?: boolean
  customPrompt?: string
  onCustomPromptChange?: (value: string) => void
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  prompts,
  selectedPrompt,
  selectedValue,
  onPromptSelect,
  enableCustom = true,
  isCustomSelected = false,
  customPrompt = '',
  onCustomPromptChange
}) => {
  const CUSTOM_ID = '__custom__'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            提示词
          </Label>
          <Select value={selectedValue} onValueChange={onPromptSelect}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="选择提示词" />
            </SelectTrigger>
            <SelectContent>
              {enableCustom && (
                <SelectItem key={CUSTOM_ID} value={CUSTOM_ID}>
                  <div className="flex gap-2 items-center">
                    <span>自定义</span>
                    <span className="text-xs text-muted-foreground">(输入自定义提示词)</span>
                  </div>
                </SelectItem>
              )}
              {prompts.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  <div className="flex gap-2 items-center">
                    <span>{prompt.name}</span>
                    {prompt.isBuiltIn && (
                      <span className="text-xs text-muted-foreground">(内置)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPrompt && !isCustomSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-[116px] p-4 bg-secondary/50 border border-border rounded-lg"
          >
            <div className="text-sm text-foreground">
              <div className="mb-1 font-medium">提示词预览：</div>
              <div className="text-muted-foreground line-clamp-2">{selectedPrompt.content}</div>
            </div>
          </motion.div>
        )}

        {enableCustom && isCustomSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-[116px] p-4 bg-secondary/50 border border-border rounded-lg space-y-2"
          >
            <div className="text-sm text-foreground font-medium">输入自定义提示词：</div>
            <Textarea
              className="min-h-[120px]"
              placeholder="请输入你的分析提示词，留空则无法提交生成"
              value={customPrompt}
              onChange={(e) => onCustomPromptChange && onCustomPromptChange(e.target.value)}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
