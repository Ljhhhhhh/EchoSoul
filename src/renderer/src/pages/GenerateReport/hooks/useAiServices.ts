/**
 * AI服务管理Hook
 */
import { useState, useEffect } from 'react'
import type { AIServiceConfig } from '@types'

export const useAiServices = () => {
  const [aiServices, setAiServices] = useState<AIServiceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [primaryService, setPrimaryService] = useState<AIServiceConfig | null>(null)

  // 加载AI服务列表
  const loadAiServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取所有AI服务配置
      const services = await window.api.aiService.getAllServices()

      // 过滤出启用的服务
      const enabledServices = services.filter((service: AIServiceConfig) => service.isEnabled)

      setAiServices(enabledServices)

      // 设置主要服务
      const primary =
        enabledServices.find((service: AIServiceConfig) => service.isPrimary) ||
        enabledServices[0] ||
        null
      setPrimaryService(primary)
    } catch (err) {
      console.error('Failed to load AI services:', err)
      setError('加载AI服务失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取默认选中的服务ID
  const getDefaultServiceId = (): string | null => {
    if (primaryService) {
      return primaryService.id
    }
    if (aiServices.length > 0) {
      return aiServices[0].id
    }
    return null
  }

  // 根据ID获取服务
  const getServiceById = (id: string): AIServiceConfig | undefined => {
    return aiServices.find((service) => service.id === id)
  }

  // 初始化时加载服务
  useEffect(() => {
    loadAiServices()
  }, [])

  return {
    aiServices,
    loading,
    error,
    primaryService,
    getDefaultServiceId,
    getServiceById,
    reload: loadAiServices
  }
}
