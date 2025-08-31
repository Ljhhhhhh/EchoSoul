import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Search, Loader2 } from 'lucide-react'
import { usePromptManagement } from '../hooks/usePromptManagement'
import { PromptCard } from './PromptCard'
import { PromptFormDialog } from './PromptFormDialog'

export const PromptManagementTab: React.FC = () => {
  const {
    showAddPrompt,
    setShowAddPrompt,
    editingPrompt,
    setEditingPrompt,
    searchQuery,
    setSearchQuery,
    filteredPrompts,
    promptTemplates,
    loading,
    handleAddPrompt,
    handleUpdatePrompt,
    handleRemovePrompt,
    handleDuplicatePrompt,
    getUserPrompts,
    getBuiltInPrompts
  } = usePromptManagement()

  const userPrompts = getUserPrompts()
  const builtInPrompts = getBuiltInPrompts()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-primary">
            <FileText className="w-5 h-5" />
            提示词管理
          </CardTitle>
          <CardDescription>管理你的自定义提示词，创建个性化的提示词</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 搜索和添加 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
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
              <Button onClick={() => setShowAddPrompt(true)} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 w-4 h-4" />
                )}
                添加提示词
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary">{promptTemplates.length}</div>
              <div className="text-sm text-muted-foreground">总提示词数</div>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary">{userPrompts.length}</div>
              <div className="text-sm text-muted-foreground">自定义提示词</div>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary">{builtInPrompts.length}</div>
              <div className="text-sm text-muted-foreground">内置提示词</div>
            </div>
          </div>

          {/* 提示词列表 */}
          <div>
            <h4 className="mb-4 font-medium text-primary">
              提示词列表 ({filteredPrompts.length})
              {loading && <Loader2 className="inline ml-2 w-4 h-4 animate-spin" />}
            </h4>
            <div className="grid gap-4">
              {loading && promptTemplates.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Loader2 className="mx-auto mb-4 w-16 h-16 text-muted-foreground animate-spin" />
                  <h3 className="mb-2 text-lg font-medium">加载中...</h3>
                  <p>正在获取提示词数据</p>
                </div>
              ) : (
                <>
                  {filteredPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={setEditingPrompt}
                      onDuplicate={handleDuplicatePrompt}
                      onDelete={handleRemovePrompt}
                      disabled={loading}
                    />
                  ))}

                  {filteredPrompts.length === 0 && !loading && (
                    <div className="py-12 text-center text-muted-foreground">
                      <FileText className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-medium">没有找到匹配的提示词</h3>
                      <p className="mb-4">尝试调整搜索条件或创建新的提示词</p>
                      <Button onClick={() => setShowAddPrompt(true)}>
                        <Plus className="mr-2 w-4 h-4" />
                        添加提示词
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
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
