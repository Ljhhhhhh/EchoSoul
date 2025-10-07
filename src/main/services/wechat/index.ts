// 先导出抽象类和类型
export { WeChatDetector } from './WeChatDetector'
export type { WeChatDataInfo, WeChatProcessInfo, DetectionResult } from './WeChatDetector'

// 再导出具体的检测器实现
export { WindowsWeChatDetector } from './WindowsWeChatDetector'
export { MacOSWeChatDetector } from './MacOSWeChatDetector'

// 最后导出服务
export {
  WeChatDetectionService,
  createWeChatDetector,
  getWeChatDetectionService
} from './WeChatDetectionService'

// 导出微信密钥服务
export {
  WeChatKeyService,
  getWeChatKeyService,
  extractWeChatKey,
  validateWeChatKey
} from './WeChatKeyService'

export type { IWeChatKeyService, KeyResult, KeyProgress } from './WeChatKeyService'

// 导出微信数据库服务
export {
  WeChatDatabaseService,
  getWeChatDatabaseService,
  decryptWeChatDatabase
} from './WeChatDatabaseService'

export type {
  IWeChatDatabaseService,
  DatabaseResult,
  DecryptionProgress,
  DecryptionParams
} from './WeChatDatabaseService'
