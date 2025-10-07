import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MessageCircle, Download, Eye } from 'lucide-react'
import dayjs from 'dayjs'
import type { Report, ReportMeta } from '@types'

/**
 * 将后端的ReportMeta数据转换为前端的Report格式
 * @param reportMeta 后端返回的报告元数据
 * @returns 转换后的Report对象
 */
const adaptReportMeta = (reportMeta: ReportMeta): Report => {
  return {
    id: reportMeta.id,
    title: reportMeta.title,
    summary: reportMeta.summary || '暂无摘要',
    createdAt: dayjs(reportMeta.createdAt).format('YYYY-MM-DD'),
    timeRange: reportMeta.metadata?.timeRange
      ? `${dayjs(reportMeta.metadata.timeRange.start).format('YYYY-MM-DD')} - ${dayjs(reportMeta.metadata.timeRange.end).format('YYYY-MM-DD')}`
      : '未知时间范围',
    targetType: reportMeta.metadata?.chatPartner || '未知对象',
    analysisType: reportMeta.metadata?.prompt?.name || '未知分析',
    messageCount: reportMeta.metadata?.messageCount || 0
  }
}

interface ReportCardProps {
  report?: Report
  reportMeta?: ReportMeta
  index?: number
  delay?: number
  showActions?: boolean
  variant?: 'default' | 'compact'
  onDownload?: (report: Report) => void
}

const ReportCard: React.FC<ReportCardProps> = ({
  report: propReport,
  reportMeta,
  index = 0,
  delay,
  showActions = false,
  variant = 'default',
  onDownload
}) => {
  // 优先使用传入的report，如果没有则从reportMeta转换
  const report = propReport || (reportMeta ? adaptReportMeta(reportMeta) : null)

  if (!report) {
    console.error('ReportCard: 必须提供 report 或 reportMeta 属性')
    return null
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDownload) {
      onDownload(report)
    }
  }

  const cardContent = (
    <Card
      className={`h-full min-w-[248px] transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:bg-secondary/20`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle
            className={`flex-1 text-foreground ${variant === 'compact' ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}`}
          >
            {report.title}
          </CardTitle>
        </div>
        <CardDescription className="space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {report.createdAt}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {report.messageCount}条消息
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className={`text-sm text-muted-foreground ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}`}
        >
          {report.summary}
        </p>
        {showActions && (
          <div className="flex gap-2">
            {onDownload && (
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Link
              to={`/report/${report.id}`}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                查看详情
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // 如果显示操作按钮，不要用Link包装整个卡片（因为操作区域已经有Link了）
  if (showActions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay || index * 0.1 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  // 如果没有onClick处理器且不显示操作按钮，用Link包装整个卡片
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || index * 0.1 }}
    >
      <Link to={`/report/${report.id}`}>{cardContent}</Link>
    </motion.div>
  )
}

export default ReportCard
