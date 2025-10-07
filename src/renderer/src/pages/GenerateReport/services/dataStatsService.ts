/**
 * 数据统计服务
 */
import type { DataStats } from '../types'
import type { Contact, ChatRoom } from '@types'

export class DataStatsService {
  /**
   * 计算数据统计
   */
  static calculateStats(
    formData: any,
    personalContacts: Contact[],
    groupChats: ChatRoom[]
  ): DataStats {
    if (!formData.timeRange || !formData.selectedContacts) {
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
      contactsInvolved = 1 // 单个联系人
      // 检查是否是群聊，群聊消息更多
      const isGroup = groupChats.some(
        (g) => g.id === formData.selectedContacts || g.name === formData.selectedContacts
      )
      if (isGroup) {
        baseMessageCount = 80
      }
    }

    const messageCount = Math.round(
      contactsInvolved * daysCovered * baseMessageCount * (0.8 + Math.random() * 0.4)
    )

    return { messageCount, daysCovered, contactsInvolved }
  }
}
