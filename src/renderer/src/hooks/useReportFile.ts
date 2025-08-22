import { useState, useEffect } from 'react'

export interface UseReportFileOptions {
  reportId: string | null
  enabled: boolean
}

export interface ReportFileState {
  content: string
  loading: boolean
  error: string | null
}

/**
 * 报告文件读取Hook
 * 处理已生成报告文件的读取
 */
export const useReportFile = ({ reportId, enabled }: UseReportFileOptions) => {
  const [state, setState] = useState<ReportFileState>({
    content: '',
    loading: false,
    error: null
  })

  useEffect(() => {
    if (!enabled || !reportId) {
      setState({
        content: '',
        loading: false,
        error: null
      })
      return
    }

    const loadReportFile = async () => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null
      }))

      try {
        const content = await window.api.report.getReport(reportId)
        setState({
          content: content || '',
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('读取报告文件失败:', error)
        setState({
          content: '',
          loading: false,
          error: error instanceof Error ? error.message : '读取报告文件失败'
        })
      }
    }

    loadReportFile()
  }, [reportId, enabled])

  return state
}
