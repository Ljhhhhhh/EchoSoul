import { Streamdown } from 'streamdown'
import { StreamingState } from '../hooks/useStreamingReport'

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
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
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
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">准备生成报告...</span>
          </div>
        )
      case 'streaming':
        return (
          <div className="flex items-center gap-2 text-green-600 mb-4">
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
          <div className="flex items-center gap-2 text-green-700 mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
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
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
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
