import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromptTemplate } from '@types'
import { Edit, Copy, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { PromptPreviewDialog } from './PromptPreviewDialog'

interface PromptCardProps {
  prompt: PromptTemplate
  onEdit: (prompt: PromptTemplate) => void
  onDuplicate: (prompt: PromptTemplate) => void
  onDelete: (promptId: string) => void
  disabled?: boolean
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDuplicate,
  onDelete,
  disabled = false
}) => {
  const [showPreview, setShowPreview] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card
        className={`transition-all duration-200 hover:shadow-md ${
          prompt.isBuiltIn
            ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
            : 'border-gray-200 hover:border-purple-200'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex gap-2 items-center mb-1">
                <CardTitle className="text-base">{prompt.name}</CardTitle>
                {prompt.isBuiltIn && (
                  <Badge variant="secondary" className="text-xs">
                    内置
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 items-center ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={disabled}
                className="p-0 w-8 h-8"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(prompt)}
                disabled={disabled}
                className="p-0 w-8 h-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
              {!prompt.isBuiltIn && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(prompt)}
                    disabled={disabled}
                    className="p-0 w-8 h-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(prompt.id)}
                    disabled={disabled}
                    className="p-0 w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>创建于 {formatDate(prompt.createdAt)}</span>
            {prompt.updatedAt !== prompt.createdAt && (
              <span>更新于 {formatDate(prompt.updatedAt)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <PromptPreviewDialog prompt={prompt} open={showPreview} onOpenChange={setShowPreview} />
    </>
  )
}
