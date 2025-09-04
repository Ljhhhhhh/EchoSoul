import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Download,
  Clock,
  MessageCircle,
  Brain,
  RefreshCw,
  Wifi,
  Sparkles,
  RotateCcw,
  Users,
  Calendar,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { ReportMeta } from '@types'

// 新的hooks和组件
import { useStreamingReport } from '@/hooks/useStreamingReport'
import { useReportFile } from '@/hooks/useReportFile'
import { StreamingMarkdown } from '@/components/StreamingMarkdown'
import { ShareReport } from '@/components/ShareReport'

// 工具函数
import {
  extractAnalysisConfigFromReportMeta,
  canRegenerateReport,
  getRegenerateDescription
} from '@/utils/reportUtils'

/**
 * 报告详情页面
 * 支持两种模式：
 * 1. 生成模式：/report/${reportId}?mode=generating - 显示实时流式生成
 * 2. 查看模式：/report/${reportId} - 显示已生成的报告文件
 */
const ReportDetail = (): React.ReactElement => {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [searchParams] = useSearchParams()

  // 判断是否为生成模式
  const isGeneratingMode = searchParams.get('mode') === 'generating'

  // 重新生成相关状态
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [reportMeta, setReportMeta] = useState<ReportMeta | null>(null)

  // 流式报告生成状态（仅在生成模式下启用）
  const streamingReport = useStreamingReport({
    reportId: reportId || '',
    enabled: Boolean(reportId) && isGeneratingMode
  })

  // 报告文件读取状态（在查看模式下启用，或生成完成后启用）
  const reportFile = useReportFile({
    reportId: reportId,
    enabled:
      Boolean(reportId) &&
      (!isGeneratingMode ||
        streamingReport.status === 'completed' ||
        streamingReport.status === 'failed')
  })

  // 获取报告元数据用于重新生成
  useEffect(() => {
    const fetchReportMeta = async () => {
      if (!reportId || isGeneratingMode) return

      try {
        const meta = await window.api.report.getReport(reportId)
        setReportMeta(meta)
      } catch (error) {
        console.error('Failed to fetch report meta:', error)
      }
    }

    fetchReportMeta()
  }, [reportId, isGeneratingMode])

  // 重新生成报告处理函数
  const handleRegenerateReport = async () => {
    if (!reportMeta || !canRegenerateReport(reportMeta)) {
      toast.error('无法重新生成此报告，缺少必要的配置信息')
      return
    }

    try {
      setIsRegenerating(true)

      // 提取原始配置
      const analysisConfig = extractAnalysisConfigFromReportMeta(reportMeta)

      // 删除旧报告
      await window.api.report.deleteReport(reportId!)

      // 生成新报告，使用相同的reportId
      await window.api.report.generateReport({
        ...analysisConfig,
        reportId: reportId // 使用相同的ID来替换旧报告
      })

      // 跳转到生成页面
      navigate(`/report/${reportId}?mode=generating&streaming=true`)

      toast.success('开始重新生成报告')
    } catch (error) {
      console.error('Failed to regenerate report:', error)
      toast.error('重新生成报告失败，请稍后重试')
      setIsRegenerating(false)
    }
  }

  // 判断是否正在生成（仅在生成模式下判断）
  const isGenerating =
    isGeneratingMode &&
    (streamingReport.status === 'pending' ||
      streamingReport.status === 'naming' ||
      streamingReport.status === 'streaming')

  // 获取内容和状态
  const getContentAndStatus = () => {
    if (isGenerating) {
      return {
        content: streamingReport.content,
        status: streamingReport.status,
        error: streamingReport.error,
        isLoading: streamingReport.isStreaming || streamingReport.status === 'pending'
      }
    } else {
      return {
        content: reportFile.content,
        status: reportFile.error ? 'failed' : reportFile.loading ? 'pending' : 'completed',
        error: reportFile.error,
        isLoading: reportFile.loading
      }
    }
  }

  const { content, status, error, isLoading } = getContentAndStatus()

  // 页面标题和描述
  const getPageInfo = () => {
    if (isGenerating) {
      return {
        title: streamingReport.status === 'naming' ? '正在为提示词命名…' : '正在生成报告',
        description:
          streamingReport.status === 'naming'
            ? '正在生成一个合适的名称'
            : '正在分析聊天数据，请耐心等待...',
        badge: { text: '生成中', variant: 'default' as const }
      }
    } else {
      const reportTitle = reportMeta?.title || '分析报告'
      const promptName =
        reportMeta?.metadata?.prompt?.name ||
        reportMeta?.metadata?.prompt?.generatedName ||
        '自定义提示词'
      const messageCount = reportMeta?.metadata?.messageCount || 0
      const chatPartner = reportMeta?.metadata?.chatPartner || '未知'

      return {
        title: reportTitle,
        description: `使用「${promptName}」分析了与 ${chatPartner} 的 ${messageCount} 条消息`,
        badge: { text: '已完成', variant: 'secondary' as const }
      }
    }
  }

  const pageInfo = getPageInfo()

  // 当流式完成或失败时，自动退出生成模式，切换到查看模式
  // 通过移除 URL 中的 mode=generating 参数，防止再次进入流式逻辑
  if (
    isGeneratingMode &&
    (streamingReport.status === 'completed' || streamingReport.status === 'failed')
  ) {
    const params = new URLSearchParams(searchParams)
    params.delete('mode')
    // 重置重新生成状态
    setIsRegenerating(false)
    navigate(`/report/${reportId}?${params.toString()}`, { replace: true })
  }

  // 当页面模式改变时重置重新生成状态
  useEffect(() => {
    if (isGeneratingMode) {
      setIsRegenerating(false)
    }
  }, [isGeneratingMode])

  // 操作按钮
  const renderActions = () => {
    if (isGenerating) {
      return (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/history')}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            返回列表
          </Button>
          {status === 'streaming' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => streamingReport.reset()}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              重新生成
            </Button>
          )}
        </div>
      )
    } else {
      return (
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            返回列表
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!content) return

              try {
                const defaultFileName = `报告_${reportId}_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`
                const result = await window.api.file.exportMarkdown(content, defaultFileName)

                if (result.success) {
                  // 可以在这里添加成功提示，比如toast通知
                  console.log('报告导出成功:', result.filePath)
                } else {
                  console.error('导出失败:', result.error)
                  // 可以在这里添加错误提示
                }
              } catch (error) {
                console.error('导出过程中发生错误:', error)
              }
            }}
            disabled={!content}
          >
            <Download className="mr-2 w-4 h-4" />
            下载报告
          </Button>
          <ShareReport content={content || ''} reportId={reportId || ''} disabled={!content} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateReport}
            disabled={!reportMeta || !canRegenerateReport(reportMeta) || isRegenerating}
            title={reportMeta ? getRegenerateDescription(reportMeta) : '无法重新生成'}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? '重新生成中...' : '重新生成'}
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col flex-1">
        {/* 头部 */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex gap-4 items-center px-6 h-14">
            <SidebarTrigger />
            <div className="flex gap-2 items-center">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">EchoSoul</span>
            </div>
            <div className="flex-1" />
            {renderActions()}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="overflow-auto flex-1">
          <div className="p-6 mx-auto space-y-6 max-w-4xl">
            {/* 报告头部信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <CardTitle>{pageInfo.title}</CardTitle>
                        <Badge variant={pageInfo.badge.variant}>{pageInfo.badge.text}</Badge>
                      </div>
                      <CardDescription>{pageInfo.description}</CardDescription>
                    </div>
                    {!isGenerating && reportMeta && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex gap-2 items-center">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(reportMeta.metadata.timeRange.start).toLocaleDateString()} -{' '}
                            {new Date(reportMeta.metadata.timeRange.end).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Users className="w-4 h-4" />
                          <span>{reportMeta.metadata.chatPartner}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <FileText className="w-4 h-4" />
                          <span>
                            {reportMeta.metadata.prompt.name ||
                              reportMeta.metadata.prompt.generatedName ||
                              '自定义提示词'}
                          </span>
                        </div>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{new Date().toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* 生成模式显示更多统计信息 */}
                {isGenerating && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <MessageCircle className="mx-auto mb-1 w-6 h-6" />
                        </div>
                        <div className="text-sm text-muted-foreground">分析消息</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <Brain className="mx-auto mb-1 w-6 h-6" />
                        </div>
                        <div className="text-sm text-muted-foreground">AI分析</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <Wifi className="mx-auto mb-1 w-6 h-6" />
                        </div>
                        <div className="text-sm text-muted-foreground">实时流式</div>
                      </div>
                      {streamingReport.status === 'naming' && (
                        <div className="flex col-span-3 gap-2 justify-center items-center text-sm text-center text-muted-foreground">
                          <Sparkles className="w-4 h-4" /> 正在为提示词命名
                          {streamingReport.promptName ? `：${streamingReport.promptName}` : '…'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* 报告内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-0">
                  <StreamingMarkdown
                    content={content}
                    status={status as any}
                    error={error || undefined}
                    className="p-6"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail
