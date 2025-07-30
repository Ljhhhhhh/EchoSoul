import { z } from 'zod'

// 用户配置
export const UserSettingsSchema = z.object({
  llmProvider: z.enum(['openai', 'anthropic', 'gemini', 'openrouter', 'deepseek']),
  apiKeyEncrypted: z.string()
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

// 聊天消息
export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  recipient: z.string(),
  timestamp: z.string(),
  content: z.string(),
  type: z.enum(['text', 'image', 'voice', 'video', 'file']).default('text'),
  isGroupChat: z.boolean().default(false),
  groupName: z.string().optional()
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
    participants: z.array(z.string()),
    prompt: z.string()
  }),
  createdAt: z.string()
})

export type ReportMeta = z.infer<typeof ReportMetaSchema>

// 分析配置
export const AnalysisConfigSchema = z.object({
  timeRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  participants: z.array(z.string()).optional(),
  prompt: z.string()
})

export type AnalysisConfig = z.infer<typeof AnalysisConfigSchema>

// 任务状态
export const TaskStatusSchema = z.object({
  id: z.string(),
  type: z.enum(['daily-report', 'custom-report']),
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

// 联系人
export interface Contact {
  id: string
  name: string
  type: 'individual' | 'group'
  avatar?: string
  lastMessageTime?: string
}

// chatlog状态
export type ChatlogStatus = 'running' | 'not-running' | 'error'

// IPC事件类型
export interface IPCEvents {
  'task:progress': (taskId: string, progress: number, message: string) => void
  'report:generated': (reportId: string) => void
  notification: (title: string, message: string) => void
}
