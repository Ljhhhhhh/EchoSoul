/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 格式化日期为YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 获取昨天的日期
 */
export function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

/**
 * 获取今天的日期
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * 解析时间范围字符串
 */
export function parseTimeRange(range: string): { start: string; end: string } {
  const today = new Date()

  switch (range) {
    case '最近7天': {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return {
        start: formatDate(weekAgo),
        end: formatDate(today)
      }
    }

    case '最近30天': {
      const monthAgo = new Date(today)
      monthAgo.setDate(monthAgo.getDate() - 30)
      return {
        start: formatDate(monthAgo),
        end: formatDate(today)
      }
    }

    case '最近一年': {
      const yearAgo = new Date(today)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      return {
        start: formatDate(yearAgo),
        end: formatDate(today)
      }
    }

    default: {
      // 默认返回最近7天
      const defaultStart = new Date(today)
      defaultStart.setDate(defaultStart.getDate() - 7)
      return {
        start: formatDate(defaultStart),
        end: formatDate(today)
      }
    }
  }
}

/**
 * 智能采样消息
 */
export function sampleMessages<T>(messages: T[], maxCount: number = 100): T[] {
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

/**
 * 错误处理Result类型
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

export function success<T>(data: T): Result<T> {
  return { success: true, data }
}

export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error }
}
