import { Streamdown } from 'streamdown'
import { StreamingState } from '../hooks/useStreamingReport'
import { AlertCircle, CheckCircle, FileText } from 'lucide-react'

export interface StreamingMarkdownProps {
  content: string
  status: StreamingState['status']
  error?: string
  className?: string
}

/**
 * 流式Markdown渲染组件
 * 使用streamdown优化AI生成内容的实时显示
 */
export const StreamingMarkdown = ({
  content,
  status,
  error,
  className
}: StreamingMarkdownProps) => {
  // 错误状态显示
  if (status === 'failed' && error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className || ''}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">生成失败</span>
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // 流式状态指示器
  const StatusIndicator = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <span className="text-sm">准备生成报告...</span>
          </div>
        )
      case 'streaming':
        return (
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <span className="text-sm">正在生成中...</span>
          </div>
        )
      case 'completed':
        return (
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">生成完成</span>
          </div>
        )
      default:
        return null
    }
  }

  // 如果没有内容且不在流式状态，显示空状态
  if (!content && status !== 'streaming' && status !== 'pending') {
    return (
      <div className={`p-8 text-center text-gray-500 ${className || ''}`}>
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>暂无报告内容</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <StatusIndicator />
      {content && (
        <div className="prose prose-slate max-w-none">
          <Streamdown>{content}</Streamdown>
        </div>
      )}
    </div>
  )
}
