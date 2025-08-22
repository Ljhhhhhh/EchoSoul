import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface ReportRouteState {
  reportId: string | null
  isGenerating: boolean
  isViewingMode: boolean
}

/**
 * 报告路由状态管理Hook
 * 统一处理生成模式和查看模式的路由状态
 */
export const useReportRoute = () => {
  const [searchParams] = useSearchParams()

  const state: ReportRouteState = useMemo(() => {
    const reportId = searchParams.get('id')
    const isGenerating = searchParams.get('generating') === 'true'

    return {
      reportId,
      isGenerating,
      isViewingMode: !isGenerating && Boolean(reportId)
    }
  }, [searchParams])

  return state
}
