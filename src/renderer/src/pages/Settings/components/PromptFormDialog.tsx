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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PromptTemplate, NewPromptTemplate } from '../types'
import { PROMPT_CATEGORIES } from '../constants'
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
    description: '',
    content: '',
    category: 'custom'
  })

  const isEditing = !!editingPrompt

  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        name: editingPrompt.name,
        description: editingPrompt.description,
        content: editingPrompt.content,
        category: editingPrompt.category
      })
    } else {
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'custom'
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
          <DialogTitle>
            {isEditing ? '编辑提示词' : '添加新提示词'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? '修改提示词的信息和内容' 
              : '创建一个新的自定义提示词，用于生成个性化分析报告'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">提示词名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例如：深度情感分析"
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="简要描述这个提示词的用途"
            />
          </div>

          <div>
            <Label htmlFor="category">分类</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">提示词内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="输入详细的提示词内容，描述你希望AI如何分析聊天记录..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              提示：可以使用换行符和编号来组织提示词结构，让AI更好地理解你的需求
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.content.trim()}
          >
            {isEditing ? '保存修改' : '添加提示词'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
