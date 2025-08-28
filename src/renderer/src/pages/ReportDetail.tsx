import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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
  Wifi
} from 'lucide-react'

// 新的hooks和组件
import { useStreamingReport } from '@/hooks/useStreamingReport'
import { useReportFile } from '@/hooks/useReportFile'
import { StreamingMarkdown } from '@/components/StreamingMarkdown'
import { ShareReport } from '@/components/ShareReport'

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

  // 判断是否正在生成（仅在生成模式下判断）
  const isGenerating =
    isGeneratingMode &&
    (streamingReport.status === 'pending' || streamingReport.status === 'streaming')

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
        title: '正在生成报告',
        description: '正在使用AI分析聊天数据，请耐心等待...',
        badge: { text: '生成中', variant: 'default' as const }
      }
    } else {
      return {
        title: '分析报告',
        description: '基于微信聊天数据的深度AI分析报告',
        badge: { text: '已完成', variant: 'secondary' as const }
      }
    }
  }

  const pageInfo = getPageInfo()

  // 操作按钮
  const renderActions = () => {
    if (isGenerating) {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          {status === 'streaming' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => streamingReport.reset()}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          )}
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: 实现下载功能
              console.log('下载报告')
            }}
            disabled={!content}
          >
            <Download className="w-4 h-4 mr-2" />
            下载报告
          </Button>
          <ShareReport content={content || ''} reportId={reportId || ''} disabled={!content} />
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col flex-1">
        {/* 头部 */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center gap-4 px-6 h-14">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">EchoSoul</span>
            </div>
            <div className="flex-1" />
            {renderActions()}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl p-6 mx-auto space-y-6">
            {/* 报告头部信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle>{pageInfo.title}</CardTitle>
                        <Badge variant={pageInfo.badge.variant}>{pageInfo.badge.text}</Badge>
                      </div>
                      <CardDescription>{pageInfo.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </CardHeader>

                {/* 生成模式显示更多统计信息 */}
                {isGenerating && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                        </div>
                        <div className="text-sm text-muted-foreground">分析消息</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <Brain className="w-6 h-6 mx-auto mb-1" />
                        </div>
                        <div className="text-sm text-muted-foreground">AI分析</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <Wifi className="w-6 h-6 mx-auto mb-1" />
                        </div>
                        <div className="text-sm text-muted-foreground">实时流式</div>
                      </div>
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
