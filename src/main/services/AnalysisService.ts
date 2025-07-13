import { createLogger } from '../utils/logger'
import type { ChatMessage, AnalysisConfig, BasicStats } from '@types'

const logger = createLogger('AnalysisService')

export class AnalysisService {
  async initialize() {
    logger.info('AnalysisService initialized')
  }

  async generateReport(messages: ChatMessage[], config: AnalysisConfig) {
    logger.info(`Generating report for ${messages.length} messages`)

    try {
      // 1. 基础统计
      const stats = this.calculateBasicStats(messages)

      // 2. AI分析（暂时返回模拟数据）
      const analysis = await this.analyzeMessages(messages, stats)

      // 3. 格式化报告
      return this.formatReport(analysis, stats, config)
    } catch (error) {
      logger.error('Failed to generate report:', error)
      throw error
    }
  }

  private calculateBasicStats(messages: ChatMessage[]): BasicStats {
    const totalMessages = messages.length

    // 计算发送/接收比例（简化实现）
    const sentMessages = messages.filter((m) => m.sender !== 'self').length
    const sendReceiveRatio = totalMessages > 0 ? sentMessages / totalMessages : 0

    // 活跃时段分析
    const hourCounts = new Map<number, number>()
    messages.forEach((message) => {
      const hour = new Date(message.timestamp).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })

    const activeHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${hour + 1}:00`)

    // 主要联系人
    const contactCounts = new Map<string, number>()
    messages.forEach((message) => {
      const contact = message.isGroupChat ? message.groupName || 'Unknown Group' : message.sender
      contactCounts.set(contact, (contactCounts.get(contact) || 0) + 1)
    })

    const topContacts = Array.from(contactCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([contact]) => contact)

    return {
      totalMessages,
      sendReceiveRatio,
      activeHours,
      topContacts
    }
  }

  private async analyzeMessages(messages: ChatMessage[], stats: BasicStats) {
    // TODO: 实现真正的AI分析
    // 这里先返回模拟数据
    logger.info('Performing AI analysis (mock implementation)')

    // 智能采样消息
    const sampledMessages = this.sampleMessages(messages, 100)

    return {
      emotion: {
        positive: 0.7,
        negative: 0.2,
        neutral: 0.1
      },
      topics: ['工作', '生活', '娱乐'],
      personality: {
        expressiveness: 0.8,
        responsiveness: 0.7,
        initiative: 0.6
      },
      social: {
        groupChatRatio: 0.6,
        privateChatRatio: 0.4,
        averageResponseTime: 15
      },
      summary: '您是一个积极乐观的人，善于表达，在社交中比较活跃，主要关注工作和生活话题。'
    }
  }

  private formatReport(analysis: any, stats: BasicStats, config: AnalysisConfig): string {
    const { start, end } = config.timeRange

    return `# 聊天记录分析报告

## 分析时间范围
${start} 至 ${end}

## 基础统计
- **消息总数**: ${stats.totalMessages}条
- **主要联系人**: ${stats.topContacts.join(', ')}
- **活跃时段**: ${stats.activeHours.join(', ')}

## 情绪分析
- **积极情绪**: ${(analysis.emotion.positive * 100).toFixed(1)}%
- **消极情绪**: ${(analysis.emotion.negative * 100).toFixed(1)}%
- **中性情绪**: ${(analysis.emotion.neutral * 100).toFixed(1)}%

## 主要话题
${analysis.topics.map((topic: string) => `- ${topic}`).join('\n')}

## 性格特征
- **表达丰富度**: ${(analysis.personality.expressiveness * 100).toFixed(1)}%
- **回应积极性**: ${(analysis.personality.responsiveness * 100).toFixed(1)}%
- **主动性**: ${(analysis.personality.initiative * 100).toFixed(1)}%

## 社交模式
- **群聊比例**: ${(analysis.social.groupChatRatio * 100).toFixed(1)}%
- **私聊比例**: ${(analysis.social.privateChatRatio * 100).toFixed(1)}%
- **平均回复时间**: ${analysis.social.averageResponseTime}分钟

## 总结
${analysis.summary}

---
*报告生成时间: ${new Date().toLocaleString()}*
`
  }

  private sampleMessages<T>(messages: T[], maxCount: number = 100): T[] {
    if (messages.length <= maxCount) {
      return messages
    }

    const step = Math.floor(messages.length / maxCount)
    const sampled: T[] = []

    for (let i = 0; i < messages.length; i += step) {
      sampled.push(messages[i])
    }

    return sampled.slice(0, maxCount)
  }

  async cleanup() {
    logger.info('AnalysisService cleaned up')
  }
}
