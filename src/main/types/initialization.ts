/**
 * 初始化流程相关的类型定义
 */

export enum InitializationStep {
  CHECKING_WECHAT = 'checking_wechat',
  GETTING_KEY = 'getting_key',
  DECRYPTING_DATABASE = 'decrypting_database',
  STARTING_SERVICE = 'starting_service',
  COMPLETED = 'completed'
}

export enum InitializationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  ERROR = 'error',
  WAITING_USER_INPUT = 'waiting_user_input'
}

export interface InitializationStepInfo {
  step: InitializationStep
  status: InitializationStatus
  progress: number // 0-100
  title: string
  description: string
  error?: string
  canRetry?: boolean
  userAction?: string // 需要用户执行的操作描述
}

export interface InitializationState {
  currentStep: InitializationStep
  steps: Record<InitializationStep, InitializationStepInfo>
  overallProgress: number // 0-100
  isCompleted: boolean
  canExit: boolean // 是否允许退出初始化页面
}

export interface WeChatInfo {
  isRunning: boolean
  processIds: number[]
  dataPath?: string
  version?: number // 3 or 4
}

export interface InitializationConfig {
  wechatKey?: string
  workDir?: string
  autoStartService?: boolean
  skipWeChatCheck?: boolean // 开发模式下可以跳过微信检查
}

export interface InitializationResult {
  success: boolean
  message: string
  data?: any
}

// 初始化步骤的配置
export const INITIALIZATION_STEPS_CONFIG: Record<
  InitializationStep,
  {
    title: string
    description: string
    weight: number // 用于计算总进度的权重
  }
> = {
  [InitializationStep.CHECKING_WECHAT]: {
    title: '检查微信状态',
    description: '正在检查微信是否正在运行...',
    weight: 15
  },
  [InitializationStep.GETTING_KEY]: {
    title: '获取微信密钥',
    description: '正在获取微信数据解密密钥...',
    weight: 25
  },

  [InitializationStep.DECRYPTING_DATABASE]: {
    title: '解密数据库',
    description: '正在解密微信数据库文件...',
    weight: 40
  },
  [InitializationStep.STARTING_SERVICE]: {
    title: '启动服务',
    description: '正在启动 Chatlog 服务...',
    weight: 10
  },
  [InitializationStep.COMPLETED]: {
    title: '初始化完成',
    description: '所有初始化步骤已完成，正在进入应用...',
    weight: 0
  }
}

// 错误类型
export enum InitializationError {
  WECHAT_NOT_RUNNING = 'wechat_not_running',
  KEY_GENERATION_FAILED = 'key_generation_failed',

  DECRYPTION_FAILED = 'decryption_failed',
  SERVICE_START_FAILED = 'service_start_failed',
  UNKNOWN_ERROR = 'unknown_error'
}

export const ERROR_MESSAGES: Record<InitializationError, string> = {
  [InitializationError.WECHAT_NOT_RUNNING]: '微信未运行，请启动微信后重试',
  [InitializationError.KEY_GENERATION_FAILED]: '获取微信密钥失败，请确保微信正在运行',

  [InitializationError.DECRYPTION_FAILED]: '数据库解密失败，请检查密钥和数据路径',
  [InitializationError.SERVICE_START_FAILED]: 'Chatlog 服务启动失败',
  [InitializationError.UNKNOWN_ERROR]: '发生未知错误'
}

// 用户操作提示
export const USER_ACTION_MESSAGES: Record<string, string> = {
  start_wechat: '请启动微信应用，然后点击重试',

  wait_decryption: '数据库解密可能需要几分钟时间，请耐心等待',
  restart_app: '如果问题持续存在，请重启应用',
  missing_wechat_key: '未检测到微信密钥，请重新初始化以获取密钥'
}
