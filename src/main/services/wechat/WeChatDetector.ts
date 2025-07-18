import { createLogger } from '../../utils/logger'

// 微信数据目录信息接口
export interface WeChatDataInfo {
  dataDir: string
  accountName: string
  version: number
  status: 'online' | 'offline'
}

// 微信进程信息
export interface WeChatProcessInfo {
  pid: number
  name: string
  version: number
}

// 检测结果
export interface DetectionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// 微信检测器抽象接口
export abstract class WeChatDetector {
  protected logger = createLogger(this.constructor.name)

  abstract detectWeChatProcesses(): Promise<DetectionResult<WeChatProcessInfo[]>>
  abstract detectDataDirectory(): Promise<DetectionResult<WeChatDataInfo>>
  abstract isWeChatRunning(): Promise<boolean>
}
