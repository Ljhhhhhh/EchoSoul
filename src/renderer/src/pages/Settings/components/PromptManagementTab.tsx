import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Search } from 'lucide-react'
import { PromptTemplate } from '../types'
import { usePromptManagement } from '../hooks/usePromptManagement'
import { PromptCard } from './PromptCard'
import { PromptFormDialog } from './PromptFormDialog'

interface PromptManagementTabProps {
  promptTemplates: PromptTemplate[]
  onAddPrompt: (prompt: PromptTemplate) => void
  onUpdatePrompt: (promptId: string, updatedPrompt: Partial<PromptTemplate>) => void
  onRemovePrompt: (promptId: string) => void
}

export const PromptManagementTab: React.FC<PromptManagementTabProps> = ({
  promptTemplates,
  onAddPrompt,
  onUpdatePrompt,
  onRemovePrompt
}) => {
  const {
    showAddPrompt,
    setShowAddPrompt,
    editingPrompt,
    setEditingPrompt,
    searchQuery,
    setSearchQuery,
    filteredPrompts,
    handleAddPrompt,
    handleUpdatePrompt,
    handleRemovePrompt,
    handleDuplicatePrompt,
    getUserPrompts,
    getBuiltInPrompts
  } = usePromptManagement({
    promptTemplates,
    onAddPrompt,
    onUpdatePrompt,
    onRemovePrompt
  })

  const userPrompts = getUserPrompts()
  const builtInPrompts = getBuiltInPrompts()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <FileText className="w-5 h-5" />
            提示词管理
          </CardTitle>
          <CardDescription>管理你的自定义提示词，创建个性化的分析模板</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 搜索和添加 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索提示词</Label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索提示词名称或内容..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setShowAddPrompt(true)}
                className="text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加提示词
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{promptTemplates.length}</div>
              <div className="text-sm text-gray-600">总提示词数</div>
            </div>
            <div className="p-4 bg-white border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userPrompts.length}</div>
              <div className="text-sm text-gray-600">自定义提示词</div>
            </div>
            <div className="p-4 bg-white border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{builtInPrompts.length}</div>
              <div className="text-sm text-gray-600">内置提示词</div>
            </div>
          </div>

          {/* 提示词列表 */}
          <div>
            <h4 className="mb-4 font-medium text-indigo-800">
              提示词列表 ({filteredPrompts.length})
            </h4>
            <div className="grid gap-4">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={setEditingPrompt}
                  onDuplicate={handleDuplicatePrompt}
                  onDelete={handleRemovePrompt}
                />
              ))}

              {filteredPrompts.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium">没有找到匹配的提示词</h3>
                  <p className="mb-4">尝试调整搜索条件或创建新的提示词</p>
                  <Button
                    onClick={() => setShowAddPrompt(true)}
                    className="text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加提示词
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 使用说明 */}
          <div className="p-4 rounded-lg bg-indigo-100/50">
            <h4 className="mb-2 font-medium text-indigo-800">使用说明</h4>
            <ul className="space-y-1 text-sm text-indigo-700">
              <li>• 内置提示词不可编辑或删除，但可以复制后修改</li>
              <li>• 自定义提示词支持完整的增删改查操作</li>
              <li>• 在生成报告时可以选择使用这些提示词模板</li>
              <li>• 提示词内容支持多行文本和结构化格式</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 添加/编辑提示词对话框 */}
      <PromptFormDialog
        open={showAddPrompt || !!editingPrompt}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddPrompt(false)
            setEditingPrompt(null)
          }
        }}
        editingPrompt={editingPrompt}
        onSave={editingPrompt ? handleUpdatePrompt : handleAddPrompt}
      />
    </motion.div>
  )
}
