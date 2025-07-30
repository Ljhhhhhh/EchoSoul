import { EventEmitter } from 'events'
import type {
  AIProvider,
  AIServiceConfig,
  AIServiceStatus,
  AIServiceTestResult,
  AIUsageStats,
  AIServiceEvent
} from '@types'
import { AIProviderFactory } from './ai/AIProviderFactory'
import { ConfigService } from './ConfigService'
import { createLogger } from '../utils/logger'

const logger = createLogger('AIServiceManager')

/**
 * AI 服务管理器
 * 负责管理多个 AI 服务提供商的配置、连接和状态监控
 */
export class AIServiceManager extends EventEmitter {
  private services = new Map<string, AIServiceConfig>()
  private statuses = new Map<string, AIServiceStatus>()
  private healthCheckInterval: NodeJS.Timeout | null = null
  private usageStats = new Map<string, AIUsageStats>()

  constructor(private configService: ConfigService) {
    super()
  }

  /**
   * 初始化 AI 服务管理器
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing AI Service Manager...')

      // 加载已保存的服务配置
      await this.loadServicesFromConfig()

      // 启动健康检查
      this.startHealthChecks()

      logger.info('AI Service Manager initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize AI Service Manager:', error)
      throw error
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up AI Service Manager...')

      // 停止健康检查
      this.stopHealthChecks()

      // 清理适配器
      await AIProviderFactory.cleanup()

      // 清空状态
      this.services.clear()
      this.statuses.clear()
      this.usageStats.clear()

      logger.info('AI Service Manager cleaned up')
    } catch (error) {
      logger.error('Failed to cleanup AI Service Manager:', error)
    }
  }

  /**
   * 添加或更新 AI 服务配置
   * @param config 服务配置
   */
  async addOrUpdateService(config: AIServiceConfig): Promise<void> {
    try {
      // 直接存储配置（不加密）
      const serviceConfig = {
        ...config,
        updatedAt: new Date().toISOString()
      }

      // 如果是新服务，设置创建时间
      if (!this.services.has(config.id)) {
        serviceConfig.createdAt = new Date().toISOString()
      }

      this.services.set(config.id, serviceConfig)

      // 保存到配置
      await this.saveServicesToConfig()

      // 初始化服务状态
      this.initializeServiceStatus(config.id, config.provider)

      // 如果服务已启用，进行健康检查
      if (config.isEnabled) {
        await this.checkServiceHealth(config.id)
      }

      this.emit('service:added', config.id, config)
      logger.info(`AI service ${config.id} (${config.provider}) added/updated`)
    } catch (error) {
      logger.error(`Failed to add/update AI service ${config.id}:`, error)
      throw error
    }
  }

  /**
   * 删除 AI 服务
   * @param serviceId 服务 ID
   */
  async removeService(serviceId: string): Promise<void> {
    try {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`Service ${serviceId} not found`)
      }

      this.services.delete(serviceId)
      this.statuses.delete(serviceId)
      this.usageStats.delete(serviceId)

      await this.saveServicesToConfig()

      this.emit('service:removed', serviceId)
      logger.info(`AI service ${serviceId} removed`)
    } catch (error) {
      logger.error(`Failed to remove AI service ${serviceId}:`, error)
      throw error
    }
  }

  /**
   * 获取服务配置
   * @param serviceId 服务 ID
   * @returns 服务配置
   */
  getService(serviceId: string): AIServiceConfig | null {
    return this.services.get(serviceId) || null
  }

  /**
   * 获取所有服务配置
   * @returns 服务配置列表
   */
  getAllServices(): AIServiceConfig[] {
    return Array.from(this.services.values())
  }

  /**
   * 获取服务状态
   * @param serviceId 服务 ID
   * @returns 服务状态
   */
  getServiceStatus(serviceId: string): AIServiceStatus | null {
    return this.statuses.get(serviceId) || null
  }

  /**
   * 获取所有服务状态
   * @returns 服务状态列表
   */
  getAllServiceStatuses(): AIServiceStatus[] {
    return Array.from(this.statuses.values())
  }

  /**
   * 测试服务连接
   * @param serviceId 服务 ID
   * @returns 测试结果
   */
  async testService(serviceId: string): Promise<AIServiceTestResult> {
    const service = this.getService(serviceId)
    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    try {
      const adapter = AIProviderFactory.getAdapter(service.provider)
      const result = await adapter.testConnection(service)

      // 更新服务状态
      this.updateServiceStatus(serviceId, {
        status: result.success ? 'healthy' : 'unhealthy',
        lastChecked: new Date().toISOString(),
        responseTime: result.responseTime,
        errorMessage: result.error
      })

      return result
    } catch (error) {
      logger.error(`Failed to test service ${serviceId}:`, error)

      this.updateServiceStatus(serviceId, {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }

  /**
   * 发送聊天请求
   * @param serviceId 服务 ID
   * @param messages 消息列表
   * @param options 请求选项
   * @returns 响应结果
   */
  async sendChatRequest(
    serviceId: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<{
    content: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    model?: string
  }> {
    const service = this.getService(serviceId)
    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    if (!service.isEnabled) {
      throw new Error(`Service ${serviceId} is disabled`)
    }

    try {
      const adapter = AIProviderFactory.getAdapter(service.provider)
      const startTime = Date.now()

      const result = await adapter.sendChatRequest(service, messages, options)

      // 记录使用统计
      this.recordUsage(serviceId, {
        responseTime: Date.now() - startTime,
        usage: result.usage
      })

      // 发出事件
      this.emitServiceEvent(serviceId, 'response', {
        messages: messages.length,
        usage: result.usage,
        model: result.model
      })

      return result
    } catch (error) {
      logger.error(`Failed to send chat request to service ${serviceId}:`, error)

      // 记录错误
      this.recordError(serviceId, error)

      // 发出错误事件
      this.emitServiceEvent(serviceId, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }

  /**
   * 获取主要服务（用于默认请求）
   * @returns 主要服务配置
   */
  getPrimaryService(): AIServiceConfig | null {
    const primaryService = Array.from(this.services.values()).find(
      (service) => service.isPrimary && service.isEnabled
    )

    if (primaryService) {
      return primaryService
    }

    // 如果没有设置主要服务，返回第一个启用的服务
    const firstEnabledService = Array.from(this.services.values()).find(
      (service) => service.isEnabled
    )

    if (firstEnabledService) {
      return firstEnabledService
    }

    return null
  }

  /**
   * 设置主要服务
   * @param serviceId 服务 ID
   */
  async setPrimaryService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId)
    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    // 清除其他服务的主要标记
    for (const [id, svc] of this.services) {
      if (svc.isPrimary) {
        this.services.set(id, { ...svc, isPrimary: false })
      }
    }

    // 设置当前服务为主要服务
    this.services.set(serviceId, { ...service, isPrimary: true })

    await this.saveServicesToConfig()
    logger.info(`Service ${serviceId} set as primary`)
  }

  /**
   * 从配置加载服务
   */
  private async loadServicesFromConfig(): Promise<void> {
    try {
      const userSettings = await this.configService.get()

      if (userSettings.aiServices && userSettings.aiServices.length > 0) {
        for (const service of userSettings.aiServices) {
          this.services.set(service.id, service)
          this.initializeServiceStatus(service.id, service.provider)
        }

        logger.info(`Loaded ${userSettings.aiServices.length} AI services from config`)
      }
    } catch (error) {
      logger.error('Failed to load services from config:', error)
    }
  }

  /**
   * 保存服务到配置
   */
  private async saveServicesToConfig(): Promise<void> {
    try {
      const userSettings = await this.configService.get()
      userSettings.aiServices = Array.from(this.services.values())
      await this.configService.set(userSettings)
    } catch (error) {
      logger.error('Failed to save services to config:', error)
      throw error
    }
  }

  /**
   * 初始化服务状态
   */
  private initializeServiceStatus(serviceId: string, provider: AIProvider): void {
    if (!this.statuses.has(serviceId)) {
      this.statuses.set(serviceId, {
        id: serviceId,
        provider,
        status: 'unknown',
        lastChecked: new Date().toISOString()
      })
    }
  }

  /**
   * 更新服务状态
   */
  private updateServiceStatus(
    serviceId: string,
    updates: Partial<Omit<AIServiceStatus, 'id' | 'provider'>>
  ): void {
    const currentStatus = this.statuses.get(serviceId)
    if (currentStatus) {
      const newStatus = { ...currentStatus, ...updates }
      this.statuses.set(serviceId, newStatus)
      this.emit('service:status-changed', serviceId, newStatus)
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthChecks(): void {
    const interval = 5 * 60 * 1000 // 5分钟

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, interval)

    logger.info('Health checks started')
  }

  /**
   * 停止健康检查
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      logger.info('Health checks stopped')
    }
  }

  /**
   * 执行健康检查
   */
  private async performHealthChecks(): Promise<void> {
    const enabledServices = Array.from(this.services.values()).filter(
      (service) => service.isEnabled
    )

    const checkPromises = enabledServices.map((service) =>
      this.checkServiceHealth(service.id).catch((error) =>
        logger.error(`Health check failed for service ${service.id}:`, error)
      )
    )

    await Promise.allSettled(checkPromises)
  }

  /**
   * 检查单个服务健康状态
   */
  private async checkServiceHealth(serviceId: string): Promise<void> {
    try {
      await this.testService(serviceId)
      this.emitServiceEvent(serviceId, 'health_check', { status: 'completed' })
    } catch (error) {
      this.emitServiceEvent(serviceId, 'health_check', {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * 记录使用统计
   */
  private recordUsage(
    serviceId: string,
    data: {
      responseTime: number
      usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
      }
    }
  ): void {
    const today = new Date().toISOString().split('T')[0]
    const service = this.services.get(serviceId)

    if (!service) return

    const statsKey = `${serviceId}-${today}`
    let stats = this.usageStats.get(statsKey)

    if (!stats) {
      stats = {
        date: today,
        provider: service.provider,
        model: service.model,
        requests: 0,
        tokensUsed: 0,
        cost: 0,
        errors: 0
      }
    }

    stats.requests += 1
    if (data.usage) {
      stats.tokensUsed += data.usage.totalTokens
    }

    // 计算平均响应时间
    if (stats.avgResponseTime) {
      stats.avgResponseTime = (stats.avgResponseTime + data.responseTime) / 2
    } else {
      stats.avgResponseTime = data.responseTime
    }

    this.usageStats.set(statsKey, stats)
    this.emit('service:usage-updated', serviceId, stats)
  }

  /**
   * 记录错误
   */
  private recordError(serviceId: string, error: any): void {
    const today = new Date().toISOString().split('T')[0]
    const statsKey = `${serviceId}-${today}`
    const stats = this.usageStats.get(statsKey)

    if (stats) {
      stats.errors += 1
      this.usageStats.set(statsKey, stats)
    }

    this.updateServiceStatus(serviceId, {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  /**
   * 发出服务事件
   */
  private emitServiceEvent(
    serviceId: string,
    type: AIServiceEvent['type'],
    data?: Record<string, any>,
    message?: string
  ): void {
    const event: AIServiceEvent = {
      id: `${serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      type,
      timestamp: new Date().toISOString(),
      data,
      message
    }

    this.emit('service:event', event)
  }
}
