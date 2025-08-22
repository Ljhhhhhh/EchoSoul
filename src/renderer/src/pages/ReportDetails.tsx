import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Download,
  Share2,
  Clock,
  MessageCircle,
  Brain,
  RefreshCw,
  Wifi,
  FileX,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useReportData } from '@/hooks/useReportData'
import { ReportProgress } from '@/components/ReportProgress'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ! 根据 ReportService.ts + 事件监听彻底重写
// ! 用 streamdown 替代 Markdown

const ReportDetails = (): React.ReactElement => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 流式响应状态
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamComplete, setStreamComplete] = useState(false)

  // 获取URL参数
  const isGenerating = searchParams.get('generating') === 'true'

  console.log('taskId:', taskId)
  console.log('isGenerating:', isGenerating)

  // 使用自定义Hook获取报告数据
  const {
    taskStatus,
    reportData,
    reportContent,
    isLoading,
    error,
    errorType,
    retryCount,
    retryGeneration,
    cancelGeneration,
    refreshReport,
    clearError
  } = useReportData({
    taskId: taskId || undefined,
    reportId: !isGenerating ? taskId || '' : undefined,
    isGenerating,
    pollingInterval: 2000,
    maxPollingAttempts: 150
  })

  // 任务完成后自动重定向到报告查看页面
  useEffect(() => {
    console.log('isGenerating:', isGenerating)
    console.log('taskStatus:', taskStatus)
    console.log('reportData:', reportData)
    console.log('reportContent:', reportContent)
    if (isGenerating && taskStatus?.status === 'completed' && reportData && reportContent) {
      // 任务完成且报告数据已加载，重定向到报告查看页面
      const newUrl = `/report/${taskId}`
      navigate(newUrl, { replace: true })
    }
  }, [isGenerating, taskStatus, reportData, reportContent, taskId, navigate])

  // 监听流式响应事件
  useEffect(() => {
    if (!isGenerating || !taskId) return

    const handleStreamStart = () => {
      setIsStreaming(true)
      setStreamingContent('')
      setStreamComplete(false)
    }

    const handleStreamChunk = (
      event: any,
      data: { reportId: string; token: string; content: string }
    ) => {
      if (data.reportId === taskId) {
        setStreamingContent(data.content)
      }
    }

    const handleStreamEnd = (event: any, data: { reportId: string; finalContent: string }) => {
      if (data.reportId === taskId) {
        setIsStreaming(false)
        setStreamComplete(true)
        setStreamingContent(data.finalContent)
      }
    }

    // 注册事件监听器
    window.electron?.on('report-stream-start', handleStreamStart)
    window.electron?.on('report-stream-chunk', handleStreamChunk)
    window.electron?.on('report-stream-end', handleStreamEnd)

    return () => {
      // 清理事件监听器
      window.electron?.removeListener('report-stream-start', handleStreamStart)
      window.electron?.removeListener('report-stream-chunk', handleStreamChunk)
      window.electron?.removeListener('report-stream-end', handleStreamEnd)
    }
  }, [isGenerating, taskId])

  // 错误状态处理（增强显示）
  if (error && !isGenerating) {
    const getErrorIcon = () => {
      switch (errorType) {
        case 'network':
          return <Wifi className="mx-auto mb-4 w-12 h-12 text-red-500" />
        case 'timeout':
          return <Clock className="mx-auto mb-4 w-12 h-12 text-orange-500" />
        case 'not_found':
          return <FileX className="mx-auto mb-4 w-12 h-12 text-gray-500" />
        case 'task_failed':
          return <XCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
        default:
          return <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
      }
    }

    const getErrorTitle = () => {
      switch (errorType) {
        case 'network':
          return '网络连接失败'
        case 'timeout':
          return '请求超时'
        case 'not_found':
          return '报告不存在'
        case 'task_failed':
          return '生成失败'
        default:
          return '报告加载失败'
      }
    }

    const getRetryText = () => {
      if (retryCount > 0) {
        return `重试 (${retryCount}/3)`
      }
      return errorType === 'not_found' ? '返回重新生成' : '重试'
    }

    return (
      <div className="flex flex-col w-full h-full">
        <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 bg-white border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">{getErrorTitle()}</h1>
        </header>
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            {getErrorIcon()}
            <p className="mb-2 text-gray-600">{error}</p>
            {retryCount > 0 && (
              <p className="mb-6 text-sm text-orange-600">
                已重试 {retryCount} 次，正在尝试恢复连接...
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  clearError()
                  if (errorType === 'not_found') {
                    retryGeneration()
                  } else {
                    refreshReport()
                  }
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {getRetryText()}
              </Button>
              <Link to="/history">
                <Button variant="outline">返回历史报告</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 生成进度展示（增强错误处理）
  if (isGenerating && taskStatus && taskStatus.status !== 'completed') {
    return (
      <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
        <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
          <SidebarTrigger />
          <Button
            variant="ghost"
            onClick={() => navigate('/history')}
            className="flex gap-2 items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">
              {taskStatus.status === 'failed' || error ? '生成失败' : '正在生成报告...'}
            </h1>
            <p className="text-sm text-gray-600">
              {error ? '报告生成遇到问题，请重试' : '请耐心等待，报告生成需要一些时间'}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-orange-600">正在重试... ({retryCount}/3)</p>
            )}
          </div>
        </header>
        <main className="overflow-auto flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <ReportProgress
              taskStatus={taskStatus}
              onCancel={cancelGeneration}
              onRetry={retryGeneration}
              error={error}
              retryCount={retryCount}
              isLoading={isLoading}
              clearError={clearError}
            />
          </div>
        </main>
      </div>
    )
  }

  // 报告未找到（仅在非生成模式下显示）
  if (!reportData && !isLoading && !isGenerating) {
    return (
      <div className="flex flex-col w-full h-full">
        <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 bg-white border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">报告未找到</h1>
        </header>
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <p className="mb-4 text-gray-600">抱歉，找不到该报告</p>
            <Link to="/history">
              <Button>返回历史报告</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // 加载中状态（排除任务已完成的情况）
  if ((isLoading || !reportData) && !(taskStatus?.status === 'completed' && isGenerating)) {
    return (
      <div className="flex flex-col w-full h-full">
        <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 bg-white border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">加载中...</h1>
        </header>
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-orange-500 animate-spin"></div>
            <p className="text-gray-600">正在加载报告数据...</p>
          </div>
        </main>
      </div>
    )
  }

  // 分析类型颜色映射
  const getAnalysisTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      情感分析: 'bg-pink-100 text-pink-700',
      人格分析: 'bg-purple-100 text-purple-700',
      关系分析: 'bg-blue-100 text-blue-700',
      工作氛围: 'bg-green-100 text-green-700',
      情商提升: 'bg-orange-100 text-orange-700',
      思维陷阱: 'bg-red-100 text-red-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
        <SidebarTrigger />
        <Button
          variant="ghost"
          onClick={() => navigate('/history')}
          className="flex gap-2 items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 line-clamp-1">{reportData.title}</h1>
          <p className="text-sm text-gray-600">{new Date(reportData.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 w-4 h-4" />
            分享
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 w-4 h-4" />
            导出
          </Button>
        </div>
      </header>

      <main className="overflow-auto flex-1 p-6">
        <div className="mx-auto space-y-8 max-w-4xl">
          {/* Report Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br border-orange-200 from-orange-100/50 to-amber-100/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-2 text-2xl text-orange-800">
                      {reportData.title}
                    </CardTitle>
                    <CardDescription className="text-base text-orange-700/80">
                      基于 {reportData.metadata.messageCount} 条消息的分析报告
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center mt-4">
                  <Badge className={getAnalysisTypeColor(reportData.metadata.prompt.content)}>
                    {reportData.metadata.prompt.content}
                  </Badge>
                  <Badge variant="outline">{reportData.metadata.participants}</Badge>
                  <div className="flex gap-1 items-center text-sm text-orange-700">
                    <Clock className="w-4 h-4" />
                    {new Date(reportData.metadata.timeRange.start).toLocaleDateString()} -{' '}
                    {new Date(reportData.metadata.timeRange.end).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1 items-center text-sm text-orange-700">
                    <MessageCircle className="w-4 h-4" />
                    {reportData.metadata.messageCount}条消息
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Detailed Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center text-gray-800">
                  <Brain className="w-5 h-5" />
                  详细分析
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-none prose prose-gray">
                {reportContent ? (
                  <div className="max-w-none prose prose-slate dark:prose-invert">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="mb-4 text-2xl font-bold text-foreground" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="mb-3 text-xl font-semibold text-foreground" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="mb-2 text-lg font-medium text-foreground" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-3 leading-relaxed text-foreground" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="pl-6 mb-3 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="pl-6 mb-3 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="text-foreground" {...props} />,
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-foreground" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-foreground" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="pl-4 my-4 italic border-l-4 border-primary text-muted-foreground"
                            {...props}
                          />
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            className="block overflow-x-auto p-3 font-mono text-sm rounded-md bg-muted"
                            {...props}
                          />
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table
                              className="min-w-full border border-collapse border-border"
                              {...props}
                            />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-3 py-2 font-semibold text-left border border-border bg-muted"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-3 py-2 border border-border" {...props} />
                        )
                      }}
                    >
                      {reportContent}
                    </Markdown>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-gray-400 animate-spin"></div>
                    <p className="text-gray-600">正在加载报告内容...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ReportDetails
