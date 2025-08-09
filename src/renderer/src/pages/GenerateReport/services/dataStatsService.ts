/**
 * 数据统计服务
 */
import type { DataStats, Contact } from '../types'

export class DataStatsService {
  /**
   * 计算数据统计
   */
  static calculateStats(
    formData: any,
    personalContacts: Contact[],
    groupChats: Contact[]
  ): DataStats {
    if (!formData.timeRange || formData.selectedContacts.length === 0) {
      return { messageCount: 0, daysCovered: 0, contactsInvolved: 0 }
    }

    // 根据时间范围计算天数
    let daysCovered = 1
    switch (formData.timeRange) {
      case 'yesterday':
        daysCovered = 1
        break
      case 'last_week':
        daysCovered = 7
        break
      case 'last_month':
        daysCovered = 30
        break
      case 'last_3_months':
        daysCovered = 90
        break
      case 'custom':
        daysCovered = 7
        break
    }

    // 根据分析对象计算联系人数量
    let contactsInvolved = 0
    let baseMessageCount = 50

    if (formData.targetType === 'all') {
      contactsInvolved = personalContacts.length + groupChats.length
    } else if (formData.targetType === 'groups') {
      contactsInvolved = groupChats.length
      baseMessageCount = 120
    } else {
      contactsInvolved = formData.selectedContacts.length
      // 检查是否包含群聊，群聊消息更多
      const hasGroups = formData.selectedContacts.some((id: string) =>
        groupChats.some((g) => g.id === id)
      )
      if (hasGroups) {
        baseMessageCount = 80
      }
    }

    const messageCount = Math.round(
      contactsInvolved * daysCovered * baseMessageCount * (0.8 + Math.random() * 0.4)
    )

    return { messageCount, daysCovered, contactsInvolved }
  }
}
