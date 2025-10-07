import { z } from 'zod'

// AI 服务提供商枚举
export const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
  'deepseek',
  'siliconflow',
  'moonshot',
  'zhipu',
  'local'
])

export type AIProvider = z.infer<typeof AIProviderSchema>

// AI 模型配置
export const AIModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: AIProviderSchema,
  maxTokens: z.number().optional(),
  contextWindow: z.number().optional(),
  costPer1kTokens: z
    .object({
      input: z.number().optional(),
      output: z.number().optional()
    })
    .optional(),
  capabilities: z
    .array(z.enum(['text', 'vision', 'function_calling', 'streaming']))
    .default(['text']),
  isDeprecated: z.boolean().default(false)
})

export type AIModelConfig = z.infer<typeof AIModelConfigSchema>

// AI 服务配置
export const AIServiceConfigSchema = z.object({
  id: z.string(),
  provider: z.string(),
  name: z.string(),
  description: z.string(),
  apiKey: z.string(), // 加密存储
  baseUrl: z.string().optional(),
  model: z.string(),
  settings: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
    timeout: z.number().positive().default(30000), // 毫秒
    retryAttempts: z.number().min(0).max(5).default(3),
    retryDelay: z.number().positive().default(1000) // 毫秒
  }),
  isEnabled: z.boolean().default(true),
  isPrimary: z.boolean().default(false), // 是否为主要服务
  createdAt: z.string(),
  updatedAt: z.string()
})

export type AIServiceConfig = z.infer<typeof AIServiceConfigSchema>

// AI 服务状态
export const AIServiceStatusSchema = z.object({
  id: z.string(),
  provider: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
  lastChecked: z.string(),
  responseTime: z.number().optional(), // 毫秒
  errorMessage: z.string().optional(),
  usage: z
    .object({
      requestsToday: z.number().default(0),
      tokensUsedToday: z.number().default(0),
      costToday: z.number().default(0),
      quotaRemaining: z.number().optional(),
      quotaResetDate: z.string().optional()
    })
    .optional()
})

export type AIServiceStatus = z.infer<typeof AIServiceStatusSchema>

// 用户配置（更新）
export const UserSettingsSchema = z.object({
  llmProvider: AIProviderSchema, // 默认提供商
  aiServices: z.array(AIServiceConfigSchema).default([]), // 所有配置的 AI 服务
  preferences: z
    .object({
      defaultModel: z.string().optional(),
      autoRetry: z.boolean().default(true),
      enableUsageTracking: z.boolean().default(false)
    })
    .default({})
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

// 聊天消息
export const ChatMessageSchema = z.object({
  seq: z.number(),
  time: z.string(),
  talker: z.string(),
  talkerName: z.string(),
  isChatRoom: z.boolean(),
  sender: z.string(),
  senderName: z.string(),
  isSelf: z.boolean(),
  type: z.number(),
  subType: z.number(),
  content: z.string()
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

// 报告元数据
export const ReportMetaSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  filePath: z.string(),
  metadata: z.object({
    messageCount: z.number(),
    timeRange: z.object({
      start: z.string(),
      end: z.string()
    }),
    participants: z.string(),
    chatPartner: z.string(),
    prompt: z.object({
      id: z.string().nullable(),
      content: z.string(),
      name: z.string().optional(),
      isTemporary: z.boolean().optional(),
      generatedName: z.string().optional() // AI生成的名称
    })
  }),
  createdAt: z.string(),
  content: z.optional(z.string()),
  summary: z.optional(z.string())
})

export type ReportMeta = z.infer<typeof ReportMetaSchema>

// 分析配置
export const AnalysisConfigSchema = z.object({
  timeRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  participants: z.string(),
  chatPartner: z.string(),
  prompt: z.object({
    id: z.string().nullable(), // 临时提示词为 null
    name: z.string().optional(), // 临时提示词初始为空，AI生成后填充
    content: z.string(),
    isTemporary: z.boolean().default(false),
    generatedName: z.string().optional() // AI生成的名称
  }),
  aiServiceId: z.string().optional() // 指定的AI服务ID
})

export interface Report {
  id: string
  title: string
  summary: string
  createdAt: string
  timeRange: string
  targetType: string
  analysisType: string
  messageCount: number
  content?: string
}

export type AnalysisConfig = z.infer<typeof AnalysisConfigSchema>

// 任务状态
export const TaskStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  errorMessage: z.string().optional(),
  result: z
    .object({
      reportId: z.string(),
      filePath: z.string()
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type TaskStatus = z.infer<typeof TaskStatusSchema>

// 基础统计
export interface BasicStats {
  totalMessages: number
  sendReceiveRatio: number
  activeHours: string[]
  topContacts: string[]
}

/**
 * 联系人相关类型定义
 */

export interface Contact {
  id: string
  userName: string
  alias: string
  remark: string
  nickName: string
  isFriend?: boolean
}

export interface ChatRoom {
  id: string
  name: string
  remark: string
  nickName: string
  users: any[]
}

// chatlog状态
export type ChatlogStatus = 'running' | 'not-running' | 'error'

// AI 服务测试结果
export const AIServiceTestResultSchema = z.object({
  success: z.boolean(),
  responseTime: z.number().optional(),
  model: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number()
    })
    .optional(),
  error: z.string().optional(),
  availableModels: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        contextLength: z.number().optional(),
        pricing: z
          .object({
            prompt: z.number(),
            completion: z.number()
          })
          .optional()
      })
    )
    .optional()
})

export type AIServiceTestResult = z.infer<typeof AIServiceTestResultSchema>

// AI 服务使用统计
export const AIUsageStatsSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  provider: z.string(),
  model: z.string(),
  requests: z.number().default(0),
  tokensUsed: z.number().default(0),
  cost: z.number().default(0),
  errors: z.number().default(0),
  avgResponseTime: z.number().optional()
})

export type AIUsageStats = z.infer<typeof AIUsageStatsSchema>

// AI 服务事件
export const AIServiceEventSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  type: z.enum(['request', 'response', 'error', 'health_check', 'config_change']),
  timestamp: z.string(),
  data: z.record(z.any()).optional(),
  message: z.string().optional()
})

export type AIServiceEvent = z.infer<typeof AIServiceEventSchema>

// 日志条目接口
export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step?: string
  details?: any
}

// IPC事件类型（扩展）
export interface IPCEvents {
  'task:progress': (taskId: string, progress: number, message: string) => void
  'report:generated': (reportId: string) => void
  'ai:service:status-changed': (serviceId: string, status: AIServiceStatus) => void
  'ai:service:usage-updated': (serviceId: string, usage: AIUsageStats) => void
  'ai:service:error': (serviceId: string, error: string) => void
  notification: (title: string, message: string) => void
}
