import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Download,
  Filter,
  Terminal,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  Clock,
  Copy,
  Check
} from 'lucide-react'

// 日志条目接口
interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step?: string
  details?: any
}

// 日志级别配置
const LOG_LEVEL_CONFIG = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badge: 'bg-red-100 text-red-800'
  },
  debug: {
    icon: Bug,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800'
  }
}

interface InitializationLogsProps {
  isExpanded: boolean
  onToggle: () => void
  logs: LogEntry[]
  onClearLogs: () => void
  className?: string
}

const InitializationLogs: React.FC<InitializationLogsProps> = ({
  isExpanded,
  onToggle,
  logs,
  onClearLogs,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(['info', 'warn', 'error', 'debug'])
  )
  const [autoScroll, setAutoScroll] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  // 格式化时间戳
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }, [])

  // 复制日志内容
  const copyLogEntry = useCallback(
    async (log: LogEntry, index: number) => {
      const logText = `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.step ? `[${log.step}] ` : ''}${log.message}`
      try {
        await navigator.clipboard.writeText(logText)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      } catch (error) {
        console.error('复制失败:', error)
      }
    },
    [formatTimestamp]
  )

  // 计算过滤后的日志
  const filteredLogs = useMemo(() => {
    let filtered = logs

    // 按级别过滤
    if (selectedLevels.size > 0) {
      filtered = filtered.filter((log) => selectedLevels.has(log.level))
    }

    // 按搜索词过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.step?.toLowerCase().includes(term) ||
          log.level.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [logs, selectedLevels, searchTerm])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  // 监听滚动事件，判断是否需要自动滚动
  const handleScroll = useCallback(() => {
    if (!logsContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoScroll(isAtBottom)
  }, [])

  // 切换日志级别过滤
  const toggleLevel = useCallback((level: string) => {
    setSelectedLevels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(level)) {
        newSet.delete(level)
      } else {
        newSet.add(level)
      }
      return newSet
    })
  }, [])

  // 清空日志
  const clearLogs = useCallback(() => {
    onClearLogs()
  }, [onClearLogs])

  // 导出日志
  const exportLogs = useCallback(() => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.step ? `[${log.step}] ` : ''}${log.message}`
      )
      .join('\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `initialization-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filteredLogs, formatTimestamp])

  const logCount = filteredLogs.length
  const errorCount = filteredLogs.filter((log) => log.level === 'error').length
  const warnCount = filteredLogs.filter((log) => log.level === 'warn').length

  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">初始化日志</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {logCount} 条
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} 错误
              </Badge>
            )}
            {warnCount > 0 && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                {warnCount} 警告
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="p-0 w-8 h-8">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="pt-3 space-y-3 border-t">
            {/* 搜索和过滤 */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索日志内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={logCount === 0}
                className="h-8"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                disabled={logCount === 0}
                className="h-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 日志级别过滤 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">级别:</span>
              {Object.entries(LOG_LEVEL_CONFIG).map(([level, config]) => {
                const isSelected = selectedLevels.has(level)
                return (
                  <Button
                    key={level}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLevel(level)}
                    className={cn('h-6 px-2 text-xs', isSelected && config.badge)}
                  >
                    <config.icon className="mr-1 w-3 h-3" />
                    {level.toUpperCase()}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div
            ref={logsContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto p-3 space-y-2 max-h-96 rounded-md border bg-gray-50/50"
          >
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Terminal className="mx-auto mb-2 w-8 h-8 opacity-50" />
                <p className="text-sm">{logs.length === 0 ? '暂无日志' : '没有匹配的日志'}</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const config = LOG_LEVEL_CONFIG[log.level]
                const IconComponent = config.icon

                return (
                  <div
                    key={index}
                    className={cn(
                      'group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-sm',
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1 space-x-2">
                          <Badge className={cn('text-xs', config.badge)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.step && (
                            <Badge variant="outline" className="text-xs">
                              {log.step}
                            </Badge>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 w-3 h-3" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{log.message}</p>
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              查看详细信息
                            </summary>
                            <pre className="overflow-x-auto p-2 mt-1 text-xs rounded bg-white/50">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLogEntry(log, index)}
                        className="p-0 w-6 h-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={logsEndRef} />
          </div>

          {/* 自动滚动提示 */}
          {!autoScroll && filteredLogs.length > 0 && (
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAutoScroll(true)
                  logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="h-6 text-xs"
              >
                <ChevronDown className="mr-1 w-3 h-3" />
                滚动到底部
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default InitializationLogs
