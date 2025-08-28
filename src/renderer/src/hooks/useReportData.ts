import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

interface TaskStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message: string
  createdAt: string
  updatedAt: string
}

interface ReportMeta {
  id: string
  date: string
  title: string
  filePath: string
  metadata: {
    messageCount: number
    participants: string
    prompt: {
      id: string
      content: string
    }
    timeRange: {
      start: string
      end: string
    }
  }
  createdAt: string
}

interface UseReportDataOptions {
  taskId?: string
  reportId?: string
  isGenerating?: boolean
  pollingInterval?: number
  maxPollingAttempts?: number
}

interface UseReportDataReturn {
  taskStatus: TaskStatus | null
  reportData: ReportMeta | null
  reportContent: string | null
  isLoading: boolean
  error: string | null
  errorType: 'network' | 'timeout' | 'task_failed' | 'not_found' | 'unknown' | null
  retryCount: number
  retryGeneration: () => void
  cancelGeneration: () => void
  refreshReport: () => void
  clearError: () => void
}

export function useReportData({
  taskId,
  reportId,
  isGenerating = false,
  pollingInterval = 2000,
  maxPollingAttempts = 150 // 5分钟最大轮询时间
}: UseReportDataOptions): UseReportDataReturn {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [reportData, setReportData] = useState<ReportMeta | null>(null)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<
    'network' | 'timeout' | 'task_failed' | 'not_found' | 'unknown' | null
  >(null)
  const [retryCount, setRetryCount] = useState(0)

  const pollingAttempts = useRef(0)
  const pollingTimer = useRef<NodeJS.Timeout | null>(null)
  const maxRetryAttempts = useRef(3)
  const { toast } = useToast()

  // 清理轮询定时器
  const clearPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current)
      pollingTimer.current = null
    }
  }, [])

  // 清除错误状态
  const clearError = useCallback(() => {
    setError(null)
    setErrorType(null)
  }, [])

  // 设置错误状态
  const setErrorState = useCallback(
    (message: string, type: 'network' | 'timeout' | 'task_failed' | 'not_found' | 'unknown') => {
      setError(message)
      setErrorType(type)
    },
    []
  )

  // 获取任务状态（带重试机制）
  const fetchTaskStatus = useCallback(
    async (id: string, attempt = 0): Promise<TaskStatus | null> => {
      try {
        const status = await window.api.task.getStatus(id)
        if (status) {
          setTaskStatus(status)
          // 重置重试计数
          if (attempt > 0) {
            setRetryCount(0)
          }
          return status
        }
        return null
      } catch (err) {
        console.error('Failed to fetch task status:', err)

        // 网络错误重试逻辑
        if (attempt < maxRetryAttempts.current) {
          setRetryCount(attempt + 1)
          console.log(
            `Retrying task status fetch, attempt ${attempt + 1}/${maxRetryAttempts.current}`
          )

          // 延迟重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          return fetchTaskStatus(id, attempt + 1)
        }

        setErrorState('获取任务状态失败，请检查网络连接', 'network')
        return null
      }
    },
    [setErrorState]
  )

  // 获取报告数据（带重试机制）
  const fetchReportData = useCallback(
    async (id: string, attempt = 0): Promise<ReportMeta | null> => {
      try {
        setIsLoading(true)
        const report = await window.api.report.getReport(id)
        if (report) {
          setReportData(report)
          // 重置重试计数
          if (attempt > 0) {
            setRetryCount(0)
          }
          return report
        } else {
          setErrorState('报告不存在或已被删除', 'not_found')
          return null
        }
      } catch (err) {
        console.error('Failed to fetch report data:', err)

        // 网络错误重试逻辑
        if (attempt < maxRetryAttempts.current) {
          setRetryCount(attempt + 1)
          console.log(
            `Retrying report data fetch, attempt ${attempt + 1}/${maxRetryAttempts.current}`
          )

          // 延迟重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          return fetchReportData(id, attempt + 1)
        }

        setErrorState('获取报告数据失败，请检查网络连接', 'network')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [setErrorState]
  )

  // 获取报告内容（带重试机制）
  // TODO:
  const fetchReportContent = useCallback(
    async (filePath: string, attempt = 0): Promise<void> => {
      try {
        // 这里需要添加读取文件内容的API
        // 暂时返回空，后续需要在preload中添加文件读取接口
        console.log('Reading report content from:', filePath)
        // const content = await window.api.report.getContent(filePath)
        // setReportContent(content)

        // 模拟网络延迟和可能的错误
        await new Promise((resolve) => setTimeout(resolve, 500))

        // 模拟随机错误用于测试重试机制
        if (attempt === 0 && Math.random() < 0.3) {
          throw new Error('Simulated network error')
        }

        setReportContent(
          `# 心理健康分析报告\n\n## 概述\n\n基于您提供的聊天记录，我们进行了深入的心理健康分析。以下是详细的分析结果：\n\n## 情感状态分析\n\n### 整体情感倾向\n\n通过对您的聊天内容进行情感分析，我们发现：\n\n- **积极情感**: 65%\n- **中性情感**: 25%\n- **消极情感**: 10%\n\n您的整体情感状态较为积极，这表明您在日常交流中保持着相对乐观的心态。\n\n### 情感波动模式\n\n| 时间段 | 情感倾向 | 强度 |\n|--------|----------|------|\n| 早晨 | 积极 | 中等 |\n| 下午 | 中性 | 低 |\n| 晚上 | 积极 | 高 |\n\n## 社交模式分析\n\n### 交流特点\n\n1. **表达方式**: 您倾向于使用温和、友善的语言\n2. **话题偏好**: 更多关注日常生活和工作相关话题\n3. **互动频率**: 保持适度的社交互动频率\n\n### 建议\n\n> 继续保持积极的沟通方式，适当增加深度话题的讨论，有助于建立更深层的人际关系。\n\n## 成长趋势\n\n### 近期变化\n\n- ✅ 情感表达更加丰富\n- ✅ 社交信心有所提升\n- ⚠️ 需要注意工作压力管理\n\n### 发展建议\n\n1. **情感管理**: 继续保持积极心态，学习更多情绪调节技巧\n2. **社交发展**: 尝试参与更多社交活动，扩展社交圈\n3. **自我成长**: 定期进行自我反思，设定个人发展目标\n\n## 总结\n\n您的心理健康状态整体良好，具有积极的生活态度和良好的社交能力。建议继续保持现有的积极状态，同时关注压力管理和个人成长。\n\n---\n\n*本报告基于AI分析生成，仅供参考。如需专业心理咨询，请联系专业心理健康机构。*`
        )

        // 重置重试计数
        if (attempt > 0) {
          setRetryCount(0)
        }
      } catch (err) {
        console.error('Failed to fetch report content:', err)

        // 网络错误重试逻辑
        if (attempt < maxRetryAttempts.current) {
          setRetryCount(attempt + 1)
          console.log(
            `Retrying report content fetch, attempt ${attempt + 1}/${maxRetryAttempts.current}`
          )

          // 延迟重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          return fetchReportContent(filePath, attempt + 1)
        }

        setErrorState('获取报告内容失败，请检查网络连接', 'network')
      }
    },
    [setErrorState]
  )

  // 开始轮询任务状态（增强错误处理）
  const startPolling = useCallback(
    (id: string) => {
      const poll = async () => {
        if (pollingAttempts.current >= maxPollingAttempts) {
          clearPolling()
          setErrorState('任务状态获取超时，请刷新页面重试', 'timeout')
          pollingAttempts.current = 0
          return
        }

        const status = await fetchTaskStatus(id)
        pollingAttempts.current++

        if (status) {
          if (status.status === 'completed') {
            // 任务完成，获取报告数据
            clearPolling()
            pollingAttempts.current = 0
            setIsLoading(false) // 重置加载状态
            const report = await fetchReportData(id)
            if (report && report.filePath) {
              await fetchReportContent(report.filePath)
            }
            toast({
              title: '报告生成完成',
              description: '报告已成功生成并加载完毕',
              duration: 3000
            })
          } else if (status.status === 'failed') {
            // 任务失败
            clearPolling()
            pollingAttempts.current = 0
            setErrorState(status.message || '报告生成失败，请检查输入数据或重试', 'task_failed')
          } else if (status.status === 'cancelled') {
            // 任务取消
            clearPolling()
            pollingAttempts.current = 0
            setErrorState('报告生成已取消', 'task_failed')
          } else {
            // 继续轮询
            pollingTimer.current = setTimeout(poll, pollingInterval)
          }
        } else {
          // 获取状态失败，继续轮询
          pollingTimer.current = setTimeout(poll, pollingInterval)
        }
      }

      // 清除之前的错误状态
      clearError()
      poll()
    },
    [
      fetchTaskStatus,
      fetchReportData,
      fetchReportContent,
      maxPollingAttempts,
      pollingInterval,
      clearPolling,
      clearError,
      setErrorState,
      toast
    ]
  )

  // 取消任务（增强错误处理）
  const cancelGeneration = useCallback(async () => {
    if (!taskId) return

    try {
      clearPolling()
      pollingAttempts.current = 0
      clearError()

      await window.api.task.cancel(taskId)
      toast({
        title: '任务已取消',
        description: '报告生成任务已成功取消',
        duration: 3000
      })
    } catch (err) {
      console.error('Failed to cancel task:', err)
      setErrorState('取消任务时发生错误', 'network')
      toast({
        title: '取消失败',
        description: '取消任务时发生错误',
        variant: 'destructive',
        duration: 3000
      })
    }
  }, [taskId, clearPolling, clearError, setErrorState, toast])

  // 重试生成（增强错误处理）
  const retryGeneration = useCallback(() => {
    try {
      // 停止当前轮询
      clearPolling()

      // 重置所有状态
      clearError()
      setTaskStatus(null)
      setReportData(null)
      setReportContent(null)
      setRetryCount(0)
      pollingAttempts.current = 0

      toast({
        title: '正在重试',
        description: '正在重新生成报告...'
      })

      // 重试逻辑需要重新跳转到生成页面
      window.history.back()
    } catch (err) {
      console.error('Failed to retry generation:', err)
      toast({
        title: '重试失败',
        description: '无法重新生成报告，请刷新页面后重试',
        variant: 'destructive'
      })
    }
  }, [clearPolling, clearError, toast])

  // 刷新报告（增强错误处理）
  const refreshReport = useCallback(async () => {
    try {
      setIsLoading(true)
      clearError()

      if (reportId) {
        const report = await fetchReportData(reportId)
        if (report && report.filePath) {
          await fetchReportContent(report.filePath)
        }
      } else if (taskId && taskStatus?.status === 'completed') {
        const report = await fetchReportData(taskId)
        if (report && report.filePath) {
          await fetchReportContent(report.filePath)
        }
      }

      toast({
        title: '刷新成功',
        description: '报告数据已更新'
      })
    } catch (err) {
      console.error('Failed to refresh report:', err)
      setErrorState('刷新失败，请检查网络连接', 'network')
      toast({
        title: '刷新失败',
        description: '无法刷新报告数据，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    reportId,
    taskId,
    taskStatus,
    fetchReportData,
    fetchReportContent,
    clearError,
    setErrorState,
    toast
  ])

  // 监听IPC进度事件
  useEffect(() => {
    if (!taskId || !isGenerating) return

    const handleTaskProgress = (
      _event: any,
      eventTaskId: string,
      progress: number,
      message: string
    ) => {
      // 只处理当前任务的进度事件
      if (eventTaskId === taskId) {
        setTaskStatus((prev) =>
          prev
            ? {
                ...prev,
                progress,
                message,
                updatedAt: new Date().toISOString()
              }
            : null
        )
      }
    }

    // 监听进度事件，使用返回的清理函数
    const cleanup = window.electron.ipcRenderer.on('task:progress', handleTaskProgress)

    return () => {
      // 使用返回的清理函数来移除事件监听器
      cleanup()
    }
  }, [taskId, isGenerating])

  // 初始化数据获取
  useEffect(() => {
    setError(null)
    pollingAttempts.current = 0

    if (isGenerating && taskId) {
      // 生成模式：开始轮询任务状态
      setIsLoading(true)
      startPolling(taskId)
    } else if (reportId) {
      // 查看模式：直接获取报告数据
      fetchReportData(reportId).then((report) => {
        if (report && report.filePath) {
          fetchReportContent(report.filePath)
        }
      })
    }

    return () => {
      clearPolling()
    }
  }, [
    taskId,
    reportId,
    isGenerating,
    startPolling,
    fetchReportData,
    fetchReportContent,
    clearPolling
  ])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPolling()
    }
  }, [clearPolling])

  return {
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
  }
}

export default useReportData
