import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle2, XCircle, RotateCcw, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message: string
  createdAt: string
  updatedAt: string
}

interface ReportProgressProps {
  taskStatus: TaskStatus | null
  onCancel?: () => void
  onRetry?: () => void
  error?: string | null
  retryCount?: number
  isLoading?: boolean
  clearError?: () => void
  className?: string
}

const statusConfig = {
  pending: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: '准备中',
    description: '正在准备生成报告...'
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: '生成中',
    description: '正在分析数据并生成报告...'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: '生成完成',
    description: '报告已成功生成！'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: '生成失败',
    description: '报告生成过程中出现错误'
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: '已取消',
    description: '报告生成已被取消'
  }
}

export function ReportProgress({
  taskStatus,
  onCancel,
  onRetry,
  error,
  retryCount = 0,
  isLoading = false,
  clearError,
  className
}: ReportProgressProps) {
  if (!taskStatus) {
    return (
      <Card className={cn('mx-auto w-full max-w-2xl', className)}>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-500">正在获取任务状态...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[taskStatus.status]
  const Icon = config.icon
  const isInProgress = taskStatus.status === 'pending' || taskStatus.status === 'running'
  const isCompleted = taskStatus.status === 'completed'
  const isFailed = taskStatus.status === 'failed'
  const isCancelled = taskStatus.status === 'cancelled'

  return (
    <Card
      className={cn(
        'w-full max-w-2xl mx-auto transition-all duration-300',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex gap-3 items-center">
          <Icon className={cn('h-6 w-6', config.color, isInProgress && 'animate-spin')} />
          <span className={config.color}>{config.title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 进度条 */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">进度</span>
              <span className={config.color}>{taskStatus.progress}%</span>
            </div>
            <Progress value={taskStatus.progress} className="h-2" />
          </div>
        )}

        {/* 状态消息 */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{config.description}</p>
          {taskStatus.message && (
            <p className="text-sm font-medium text-gray-800">{taskStatus.message}</p>
          )}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex gap-2 items-start">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">错误信息</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
          {retryCount > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex gap-2 items-center">
                <RotateCcw className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">正在重试... ({retryCount}/3)</span>
              </div>
            </div>
          )}
        </div>

        {/* 时间信息 */}
        <div className="space-y-1 text-xs text-gray-500">
          <div>开始时间: {new Date(taskStatus.createdAt).toLocaleString('zh-CN')}</div>
          <div>更新时间: {new Date(taskStatus.updatedAt).toLocaleString('zh-CN')}</div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          {isInProgress && !error && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              取消生成
            </Button>
          )}

          {(isFailed || error) && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (clearError) clearError()
                onRetry()
              }}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <RotateCcw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {retryCount > 0 ? `重试 (${retryCount}/3)` : '重新生成'}
            </Button>
          )}

          {error && clearError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-gray-600 hover:text-gray-700"
            >
              清除错误
            </Button>
          )}
        </div>

        {/* 成功状态的额外信息 */}
        {isCompleted && (
          <div className="p-3 mt-4 bg-green-100 rounded-lg border border-green-200">
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                报告生成成功！正在加载报告内容...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReportProgress
