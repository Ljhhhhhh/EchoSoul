import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromptTemplate } from '../types'
import { PROMPT_CATEGORIES } from '../constants'
import { Edit, Copy, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { PromptPreviewDialog } from './PromptPreviewDialog'

interface PromptCardProps {
  prompt: PromptTemplate
  onEdit: (prompt: PromptTemplate) => void
  onDuplicate: (prompt: PromptTemplate) => void
  onDelete: (promptId: string) => void
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const [showPreview, setShowPreview] = useState(false)
  
  const category = PROMPT_CATEGORIES.find(cat => cat.value === prompt.category)
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        prompt.isBuiltIn 
          ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' 
          : 'border-gray-200 hover:border-purple-200'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{prompt.name}</CardTitle>
                {prompt.isBuiltIn && (
                  <Badge variant="secondary" className="text-xs">
                    内置
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {category?.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {prompt.description}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(prompt)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {!prompt.isBuiltIn && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(prompt)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(prompt.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>创建于 {formatDate(prompt.createdAt)}</span>
            {prompt.updatedAt !== prompt.createdAt && (
              <span>更新于 {formatDate(prompt.updatedAt)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <PromptPreviewDialog
        prompt={prompt}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </>
  )
}
