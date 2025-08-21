// 重构后的服务架构统一导出

// 服务工厂
export { ServiceFactory, createServiceContainer, getServiceFactory } from './ServiceFactory'

export type { ServiceContainer, ServiceFactoryConfig } from './ServiceFactory'

// 微信相关服务
export {
  WeChatDetectionService,
  createWeChatDetector,
  getWeChatDetectionService,
  WeChatKeyService,
  getWeChatKeyService,
  extractWeChatKey,
  validateWeChatKey,
  WeChatDatabaseService,
  getWeChatDatabaseService,
  decryptWeChatDatabase
} from './wechat'

export type {
  WeChatDetector,
  WeChatDataInfo,
  WeChatProcessInfo,
  DetectionResult,
  IWeChatKeyService,
  KeyResult,
  KeyProgress,
  IWeChatDatabaseService,
  DatabaseResult,
  DecryptionProgress,
  DecryptionParams
} from './wechat'

// 进程服务
export { ProcessService } from './process/ProcessService'

export type { ProcessStatus, ProcessConfig, ProcessResult } from './process/ProcessService'

// API 服务
export { ChatlogApiService, getChatlogApiService, checkChatlogService } from './api'

export type {
  IChatlogApiService,
  ApiServiceConfig,
  GetMessagesParams,
  GetContactsParams,
  ChatroomInfo,
  SessionInfo,
  ApiResult
} from './api'

// 初始化编排器
export { InitializationOrchestrator } from './InitializationOrchestrator'

export type { ServiceDependencies } from './InitializationOrchestrator'

// 配置服务
export { ConfigService } from './ConfigService'
