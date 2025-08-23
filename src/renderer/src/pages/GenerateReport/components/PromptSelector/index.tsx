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

interface PromptSelectorProps {
  prompts: PromptTemplate[]
  selectedPrompt: PromptTemplate | null
  onPromptSelect: (promptId: string) => void
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  prompts,
  selectedPrompt,
  onPromptSelect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
            <FileText className="w-5 h-5 text-purple-500" />
            分析模板
          </Label>
          <Select value={selectedPrompt?.id || ''} onValueChange={onPromptSelect}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="选择分析模板" />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  <div className="flex gap-2 items-center">
                    <span>{prompt.name}</span>
                    {prompt.isBuiltIn && <span className="text-xs text-gray-500">(内置)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-[116px] p-4 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="text-sm text-purple-700">
              <div className="mb-1 font-medium">模板预览：</div>
              <div className="text-purple-600 line-clamp-2">{selectedPrompt.content}</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
