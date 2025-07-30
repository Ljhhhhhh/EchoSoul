import { EventEmitter } from 'events'
import type { AIServiceConfig, AIServiceTestResult } from '@types'
import { AIProviderFactory } from './ai/AIProviderFactory'
import { createLogger } from '../utils/logger'

const logger = createLogger('AIHealthCheckService')

export interface HealthCheckOptions {
  interval?: number // 检查间隔（毫秒）
  timeout?: number // 单次检查超时（毫秒）
  retryAttempts?: number // 重试次数
  retryDelay?: number // 重试延迟（毫秒）
  enableQuotaCheck?: boolean // 是否启用配额检查
  enableLatencyMonitoring?: boolean // 是否启用延迟监控
}

export interface HealthCheckResult {
  serviceId: string
  timestamp: string
  success: boolean
  responseTime: number
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    connection: boolean
    apiKey: boolean
    quota?: {
      available: boolean
      remaining?: number
      resetDate?: string
    }
    latency: {
      current: number
      average: number
      trend: 'improving' | 'stable' | 'degrading'
    }
    errors: string[]
  }
}

/**
 * AI 服务健康检查服务
 * 提供更详细的健康监控和诊断功能
 */
export class AIHealthCheckService extends EventEmitter {
  private checkIntervals = new Map<string, NodeJS.Timeout>()
  private healthHistory = new Map<string, HealthCheckResult[]>()
  private latencyHistory = new Map<string, number[]>()
  private readonly maxHistorySize = 100

  private defaultOptions: Required<HealthCheckOptions> = {
    interval: 5 * 60 * 1000, // 5分钟
    timeout: 30000, // 30秒
    retryAttempts: 3,
    retryDelay: 1000, // 1秒
    enableQuotaCheck: true,
    enableLatencyMonitoring: true
  }

  constructor() {
    super()
  }

  /**
   * 启动服务健康检查
   * @param serviceId 服务 ID
   * @param config 服务配置
   * @param options 检查选项
   */
  startHealthCheck(
    serviceId: string,
    config: AIServiceConfig,
    options?: Partial<HealthCheckOptions>
  ): void {
    // 停止现有的检查
    this.stopHealthCheck(serviceId)

    const checkOptions = { ...this.defaultOptions, ...options }

    // 立即执行一次检查
    this.performHealthCheck(serviceId, config, checkOptions)

    // 设置定期检查
    const interval = setInterval(() => {
      this.performHealthCheck(serviceId, config, checkOptions)
    }, checkOptions.interval)

    this.checkIntervals.set(serviceId, interval)
    logger.info(`Health check started for service ${serviceId}`)
  }

  /**
   * 停止服务健康检查
   * @param serviceId 服务 ID
   */
  stopHealthCheck(serviceId: string): void {
    const interval = this.checkIntervals.get(serviceId)
    if (interval) {
      clearInterval(interval)
      this.checkIntervals.delete(serviceId)
      logger.info(`Health check stopped for service ${serviceId}`)
    }
  }

  /**
   * 停止所有健康检查
   */
  stopAllHealthChecks(): void {
    for (const [serviceId] of this.checkIntervals) {
      this.stopHealthCheck(serviceId)
    }
  }

  /**
   * 手动执行健康检查
   * @param serviceId 服务 ID
   * @param config 服务配置
   * @param options 检查选项
   * @returns 检查结果
   */
  async performHealthCheck(
    serviceId: string,
    config: AIServiceConfig,
    options?: Partial<HealthCheckOptions>
  ): Promise<HealthCheckResult> {
    const checkOptions = { ...this.defaultOptions, ...options }
    const startTime = Date.now()
    const timestamp = new Date().toISOString()

    const result: HealthCheckResult = {
      serviceId,
      timestamp,
      success: false,
      responseTime: 0,
      status: 'unhealthy',
      details: {
        connection: false,
        apiKey: false,
        latency: {
          current: 0,
          average: 0,
          trend: 'stable'
        },
        errors: []
      }
    }

    try {
      // 1. 基础连接测试
      const connectionResult = await this.testConnection(config, checkOptions)
      result.details.connection = connectionResult.success
      result.responseTime = connectionResult.responseTime || 0

      if (!connectionResult.success) {
        result.details.errors.push(connectionResult.error || 'Connection failed')
      }

      // 2. API 密钥验证
      if (result.details.connection) {
        try {
          const adapter = AIProviderFactory.getAdapter(config.provider)
          result.details.apiKey = await adapter.validateApiKey(config.apiKey, config.baseUrl)

          if (!result.details.apiKey) {
            result.details.errors.push('Invalid API key')
          }
        } catch (error) {
          result.details.apiKey = false
          result.details.errors.push(`API key validation failed: ${error}`)
        }
      }

      // 3. 配额检查（如果启用）
      if (checkOptions.enableQuotaCheck && result.details.connection && result.details.apiKey) {
        try {
          const quotaInfo = await this.checkQuota(config)
          result.details.quota = quotaInfo
        } catch (error) {
          result.details.errors.push(`Quota check failed: ${error}`)
        }
      }

      // 4. 延迟监控（如果启用）
      if (checkOptions.enableLatencyMonitoring) {
        const latencyInfo = this.analyzeLatency(serviceId, result.responseTime)
        result.details.latency = latencyInfo
      }

      // 5. 确定整体状态
      result.status = this.determineHealthStatus(result)
      result.success = result.status !== 'unhealthy'
    } catch (error) {
      result.details.errors.push(`Health check failed: ${error}`)
      result.responseTime = Date.now() - startTime
    }

    // 记录历史
    this.recordHealthHistory(serviceId, result)

    // 发出事件
    this.emit('health-check-completed', result)

    if (result.status === 'unhealthy') {
      this.emit('service-unhealthy', serviceId, result)
    } else if (result.status === 'degraded') {
      this.emit('service-degraded', serviceId, result)
    }

    return result
  }

  /**
   * 获取服务健康历史
   * @param serviceId 服务 ID
   * @param limit 返回记录数限制
   * @returns 健康检查历史
   */
  getHealthHistory(serviceId: string, limit?: number): HealthCheckResult[] {
    const history = this.healthHistory.get(serviceId) || []
    return limit ? history.slice(-limit) : history
  }

  /**
   * 获取服务健康统计
   * @param serviceId 服务 ID
   * @param timeRange 时间范围（毫秒）
   * @returns 健康统计
   */
  getHealthStats(
    serviceId: string,
    timeRange?: number
  ): {
    totalChecks: number
    successRate: number
    averageResponseTime: number
    uptime: number
    lastCheck?: HealthCheckResult
  } {
    const history = this.healthHistory.get(serviceId) || []

    if (history.length === 0) {
      return {
        totalChecks: 0,
        successRate: 0,
        averageResponseTime: 0,
        uptime: 0
      }
    }

    let relevantHistory = history
    if (timeRange) {
      const cutoffTime = Date.now() - timeRange
      relevantHistory = history.filter(
        (result) => new Date(result.timestamp).getTime() > cutoffTime
      )
    }

    const totalChecks = relevantHistory.length
    const successfulChecks = relevantHistory.filter((result) => result.success).length
    const successRate = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0

    const averageResponseTime =
      relevantHistory.reduce((sum, result) => sum + result.responseTime, 0) / totalChecks

    const uptime = successRate

    return {
      totalChecks,
      successRate,
      averageResponseTime,
      uptime,
      lastCheck: history[history.length - 1]
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    this.stopAllHealthChecks()
    this.healthHistory.clear()
    this.latencyHistory.clear()
    logger.info('AI Health Check Service cleaned up')
  }

  /**
   * 测试连接
   */
  private async testConnection(
    config: AIServiceConfig,
    options: Required<HealthCheckOptions>
  ): Promise<AIServiceTestResult> {
    const adapter = AIProviderFactory.getAdapter(config.provider)

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: 'Connection timeout'
        })
      }, options.timeout)

      adapter
        .testConnection(config)
        .then((result) => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeout)
          resolve({
            success: false,
            error: error.message || 'Connection failed'
          })
        })
    })
  }

  /**
   * 检查配额
   */
  private async checkQuota(config: AIServiceConfig): Promise<{
    available: boolean
    remaining?: number
    resetDate?: string
  }> {
    const adapter = AIProviderFactory.getAdapter(config.provider)

    if (adapter.getQuotaInfo) {
      try {
        const quotaInfo = await adapter.getQuotaInfo(config)
        return {
          available: quotaInfo.remaining > 0,
          remaining: quotaInfo.remaining,
          resetDate: quotaInfo.resetDate
        }
      } catch (error) {
        return { available: true } // 假设可用，如果无法检查
      }
    }

    return { available: true } // 默认假设可用
  }

  /**
   * 分析延迟
   */
  private analyzeLatency(
    serviceId: string,
    currentLatency: number
  ): {
    current: number
    average: number
    trend: 'improving' | 'stable' | 'degrading'
  } {
    let history = this.latencyHistory.get(serviceId) || []
    history.push(currentLatency)

    // 保持历史记录大小
    if (history.length > this.maxHistorySize) {
      history = history.slice(-this.maxHistorySize)
      this.latencyHistory.set(serviceId, history)
    } else {
      this.latencyHistory.set(serviceId, history)
    }

    const average = history.reduce((sum, latency) => sum + latency, 0) / history.length

    // 分析趋势（比较最近10次和之前10次的平均值）
    let trend: 'improving' | 'stable' | 'degrading' = 'stable'
    if (history.length >= 20) {
      const recent = history.slice(-10)
      const previous = history.slice(-20, -10)

      const recentAvg = recent.reduce((sum, l) => sum + l, 0) / recent.length
      const previousAvg = previous.reduce((sum, l) => sum + l, 0) / previous.length

      const change = (recentAvg - previousAvg) / previousAvg

      if (change < -0.1) {
        trend = 'improving'
      } else if (change > 0.1) {
        trend = 'degrading'
      }
    }

    return {
      current: currentLatency,
      average,
      trend
    }
  }

  /**
   * 确定健康状态
   */
  private determineHealthStatus(result: HealthCheckResult): 'healthy' | 'degraded' | 'unhealthy' {
    if (!result.details.connection || !result.details.apiKey) {
      return 'unhealthy'
    }

    if (result.details.quota && !result.details.quota.available) {
      return 'unhealthy'
    }

    if (result.responseTime > 10000) {
      // 超过10秒认为性能降级
      return 'degraded'
    }

    if (result.details.latency.trend === 'degrading') {
      return 'degraded'
    }

    return 'healthy'
  }

  /**
   * 记录健康历史
   */
  private recordHealthHistory(serviceId: string, result: HealthCheckResult): void {
    let history = this.healthHistory.get(serviceId) || []
    history.push(result)

    // 保持历史记录大小
    if (history.length > this.maxHistorySize) {
      history = history.slice(-this.maxHistorySize)
    }

    this.healthHistory.set(serviceId, history)
  }
}
