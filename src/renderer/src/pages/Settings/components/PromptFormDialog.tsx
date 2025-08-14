import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PromptTemplate, NewPromptTemplate } from '@types'
import { useState, useEffect } from 'react'

interface PromptFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPrompt?: PromptTemplate | null
  onSave: (prompt: NewPromptTemplate | Partial<PromptTemplate>) => void
}

export const PromptFormDialog: React.FC<PromptFormDialogProps> = ({
  open,
  onOpenChange,
  editingPrompt,
  onSave
}) => {
  const [formData, setFormData] = useState<NewPromptTemplate>({
    name: '',
    content: ''
  })

  const isEditing = !!editingPrompt

  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        name: editingPrompt.name,
        content: editingPrompt.content
      })
    } else {
      setFormData({
        name: '',
        content: ''
      })
    }
  }, [editingPrompt, open])

  const handleSave = () => {
    if (isEditing) {
      onSave(formData)
    } else {
      onSave(formData)
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑提示词' : '添加提示词'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改提示词的内容' : '创建一个自定义提示词，生成个性化分析报告'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">提示词名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：深度情感分析"
            />
          </div>

          <div>
            <Label htmlFor="content">提示词内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="输入详细的提示词内容，描述你希望AI如何分析聊天记录..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              提示：可以使用markdown格式来编写提示词，让AI更好地理解你的需求
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.content.trim()}>
            {isEditing ? '保存修改' : '添加提示词'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
