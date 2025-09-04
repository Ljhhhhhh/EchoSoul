import type { ReportMeta, AnalysisConfig } from '@types'

/**
 * 从报告元数据中提取分析配置
 * 用于重新生成报告时重用原始配置
 * @param reportMeta 报告元数据
 * @returns 分析配置对象
 */
export const extractAnalysisConfigFromReportMeta = (reportMeta: ReportMeta): AnalysisConfig => {
  const { metadata } = reportMeta

  return {
    timeRange: {
      start: metadata.timeRange.start,
      end: metadata.timeRange.end
    },
    participants: metadata.participants,
    chatPartner: metadata.chatPartner,
    prompt: {
      id: metadata.prompt.id,
      name: metadata.prompt.name,
      content: metadata.prompt.content,
      isTemporary: metadata.prompt.isTemporary || false,
      generatedName: metadata.prompt.generatedName
    }
    // aiServiceId 在重新生成时可以使用当前默认服务，所以不设置
  }
}

/**
 * 检查报告是否可以重新生成
 * @param reportMeta 报告元数据
 * @returns 是否可以重新生成
 */
export const canRegenerateReport = (reportMeta: ReportMeta): boolean => {
  // 检查必要的元数据是否存在
  return !!(
    reportMeta.metadata?.timeRange?.start &&
    reportMeta.metadata?.timeRange?.end &&
    reportMeta.metadata?.participants &&
    reportMeta.metadata?.chatPartner &&
    reportMeta.metadata?.prompt?.content
  )
}

/**
 * 生成重新生成报告的描述文本
 * @param reportMeta 报告元数据
 * @returns 描述文本
 */
export const getRegenerateDescription = (reportMeta: ReportMeta): string => {
  const { metadata } = reportMeta
  const promptName = metadata.prompt?.generatedName || metadata.prompt?.name || '自定义分析'
  const chatPartner = metadata.chatPartner

  return `将使用相同的配置重新生成「${chatPartner} - ${promptName}」报告`
}
