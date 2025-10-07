import { useState, useEffect, useCallback } from 'react'

export interface StreamingState {
  content: string
  status: 'pending' | 'naming' | 'streaming' | 'completed' | 'failed'
  error?: string
  promptName?: string
}

export interface UseStreamingReportOptions {
  reportId: string
  enabled: boolean
}

/**
 * 流式报告内容管理Hook
 * 监听主进程发送的流式事件，实时更新内容
 */
export const useStreamingReport = ({ reportId, enabled }: UseStreamingReportOptions) => {
  const [state, setState] = useState<StreamingState>({
    content: '',
    status: 'pending'
  })

  // 重置状态
  const reset = useCallback(() => {
    setState({
      content: '',
      status: 'pending'
    })
  }, [])

  // 设置错误状态
  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: 'failed',
      error
    }))
  }, [])

  useEffect(() => {
    if (!enabled || !reportId) {
      return
    }

    // 事件处理器
    const handleStreamStart = (
      event: any,
      data: { reportId: string; messageCount: number; config: any }
    ) => {
      if (data.reportId === reportId) {
        setState((prev) => ({
          ...prev,
          status: 'streaming',
          error: undefined
        }))
        console.log('报告生成开始，消息数量:', data.messageCount)
      }
    }

    const handleStreamStatus = (
      event: any,
      data: { reportId: string; status: string; message?: string; promptName?: string }
    ) => {
      if (data.reportId !== reportId) return
      if (data.status === 'generating_prompt_name') {
        setState((prev) => ({ ...prev, status: 'naming', error: undefined }))
      }
      if (data.promptName) {
        setState((prev) => ({ ...prev, promptName: data.promptName }))
      }
    }

    const handleStreamChunk = (
      event: any,
      data: { reportId: string; token: string; content: string }
    ) => {
      if (data.reportId === reportId) {
        setState((prev) => ({
          ...prev,
          content: data.content,
          status: 'streaming',
          error: undefined
        }))
      }
    }

    const handleStreamEnd = (event: any, data: { reportId: string; finalContent: string }) => {
      if (data.reportId === reportId) {
        setState((prev) => ({
          ...prev,
          content: data.finalContent,
          status: 'completed'
        }))
      }
    }

    const handleStreamError = (event: any, data: { reportId: string; error: string }) => {
      if (data.reportId === reportId) {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: data.error
        }))
      }
    }

    // 使用window.electron.ipcRenderer来监听事件
    const { ipcRenderer } = window.electron
    ipcRenderer.on('report-stream-start', handleStreamStart)
    ipcRenderer.on('report-stream-status', handleStreamStatus)
    ipcRenderer.on('report-stream-chunk', handleStreamChunk)
    ipcRenderer.on('report-stream-end', handleStreamEnd)
    ipcRenderer.on('report-stream-error', handleStreamError)

    // 初始化流式状态：仅当初次启用或reportId变化时且当前状态不是completed/failed时重置
    setState((prev) => {
      if (prev.status === 'completed' || prev.status === 'failed') {
        return prev
      }
      return { ...prev, status: 'pending' }
    })

    return () => {
      // 清理事件监听器
      ipcRenderer.removeAllListeners('report-stream-start')
      ipcRenderer.removeAllListeners('report-stream-status')
      ipcRenderer.removeAllListeners('report-stream-chunk')
      ipcRenderer.removeAllListeners('report-stream-end')
      ipcRenderer.removeAllListeners('report-stream-error')
    }
  }, [reportId, enabled])

  return {
    ...state,
    reset,
    setError,
    isStreaming: state.status === 'streaming',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed'
  }
}
