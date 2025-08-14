import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PromptTemplate } from '@types'

interface PromptPreviewDialogProps {
  prompt: PromptTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PromptPreviewDialog: React.FC<PromptPreviewDialogProps> = ({
  prompt,
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex gap-2 items-center mb-2">
            <DialogTitle>{prompt.name}</DialogTitle>
            {prompt.isBuiltIn && (
              <Badge variant="secondary" className="text-xs">
                内置
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">提示词内容</h4>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                {prompt.content}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">创建时间：</span>
              {new Date(prompt.createdAt).toLocaleString('zh-CN')}
            </div>
            <div>
              <span className="font-medium">更新时间：</span>
              {new Date(prompt.updatedAt).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
