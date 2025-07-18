import { EventEmitter } from 'events'
import { createLogger } from '../../utils/logger'
import { WindowsWeChatDetector } from './WindowsWeChatDetector'
import { MacOSWeChatDetector } from './MacOSWeChatDetector'
import {
  WeChatDetector,
  WeChatDataInfo,
  WeChatProcessInfo,
  DetectionResult
} from './WeChatDetector'

const logger = createLogger('WeChatDetectionService')

// 重新导出类型和抽象类
export { WeChatDetector }
export type { WeChatDataInfo, WeChatProcessInfo, DetectionResult }

// 微信检测服务
export class WeChatDetectionService extends EventEmitter {
  private detector: WeChatDetector
  private cachedDataInfo: WeChatDataInfo | null = null
  private lastDetectionTime = 0
  private readonly CACHE_TTL = 30000 // 30秒缓存

  constructor(detector: WeChatDetector) {
    super()
    this.detector = detector
  }

  /**
   * 检测微信是否运行
   */
  async isWeChatRunning(): Promise<boolean> {
    try {
      return await this.detector.isWeChatRunning()
    } catch (error) {
      logger.error('Error checking WeChat status:', error)
      return false
    }
  }

  /**
   * 获取微信进程信息
   */
  async getWeChatProcesses(): Promise<DetectionResult<WeChatProcessInfo[]>> {
    try {
      return await this.detector.detectWeChatProcesses()
    } catch (error) {
      logger.error('Error detecting WeChat processes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 获取微信数据目录信息（带缓存）
   */
  async getWeChatDataInfo(useCache = true): Promise<DetectionResult<WeChatDataInfo>> {
    const now = Date.now()

    // 检查缓存
    if (useCache && this.cachedDataInfo && now - this.lastDetectionTime < this.CACHE_TTL) {
      logger.debug('Using cached WeChat data info')
      return {
        success: true,
        data: this.cachedDataInfo
      }
    }

    try {
      const result = await this.detector.detectDataDirectory()

      if (result.success && result.data) {
        this.cachedDataInfo = result.data
        this.lastDetectionTime = now
        this.emit('dataDirectoryDetected', result.data)
      }

      return result
    } catch (error) {
      logger.error('Error detecting WeChat data directory:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedDataInfo = null
    this.lastDetectionTime = 0
    logger.debug('WeChat detection cache cleared')
  }

  /**
   * 监听微信状态变化
   */
  async startMonitoring(interval = 5000): Promise<void> {
    const checkStatus = async () => {
      const isRunning = await this.isWeChatRunning()
      this.emit('statusChanged', isRunning)

      if (isRunning) {
        // 如果微信在运行，尝试获取数据目录信息
        const dataInfo = await this.getWeChatDataInfo(false)
        if (dataInfo.success) {
          this.emit('dataDirectoryUpdated', dataInfo.data)
        }
      }
    }

    // 立即检查一次
    await checkStatus()

    // 定期检查
    const intervalId = setInterval(checkStatus, interval)

    // 提供停止监听的方法
    this.once('stopMonitoring', () => {
      clearInterval(intervalId)
    })
  }

  /**
   * 停止监听
   */
  stopMonitoring(): void {
    this.emit('stopMonitoring')
  }
}

// 工厂函数：根据平台创建合适的检测器
export function createWeChatDetector(): WeChatDetector {
  const platform = process.platform

  if (platform === 'win32') {
    return new WindowsWeChatDetector()
  } else if (platform === 'darwin') {
    return new MacOSWeChatDetector()
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

// 单例服务实例
let wechatDetectionService: WeChatDetectionService | null = null

export function getWeChatDetectionService(): WeChatDetectionService {
  if (!wechatDetectionService) {
    const detector = createWeChatDetector()
    wechatDetectionService = new WeChatDetectionService(detector)
  }
  return wechatDetectionService
}
