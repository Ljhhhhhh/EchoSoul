import { z } from 'zod'

// Prompt模板Schema
export const PromptTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '提示词名称不能为空'),
  content: z.string().min(1, '提示词内容不能为空'),
  isBuiltIn: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string()
})

// 新建Prompt模板Schema
export const NewPromptTemplateSchema = z.object({
  name: z.string().min(1, '提示词名称不能为空'),
  content: z.string().min(1, '提示词内容不能为空')
})

// 更新Prompt模板Schema
export const UpdatePromptTemplateSchema = z.object({
  name: z.string().min(1, '提示词名称不能为空').optional(),
  content: z.string().min(1, '提示词内容不能为空').optional()
})

// 类型导出
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>
export type NewPromptTemplate = z.infer<typeof NewPromptTemplateSchema>
export type UpdatePromptTemplate = z.infer<typeof UpdatePromptTemplateSchema>

// 内置Prompt模板
export const BUILT_IN_PROMPTS: PromptTemplate[] = [
  {
    id: 'emotion-analysis',
    name: '情感分析',
    content:
      '请分析这些聊天记录中的情感变化，包括：\n1. 主要情绪类型和强度\n2. 情绪变化的时间模式\n3. 影响情绪的关键因素\n4. 情绪管理的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'personality-analysis',
    name: '人格分析',
    content:
      '基于这些聊天记录，请分析我的人格特征：\n1. 主要性格特点\n2. 沟通风格和习惯\n3. 价值观和兴趣偏好\n4. 人际交往模式\n5. 个人成长建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'relationship-analysis',
    name: '关系分析',
    content:
      '请分析我与这些联系人的关系模式：\n1. 互动频率和时间分布\n2. 话题偏好和共同兴趣\n3. 沟通风格的匹配度\n4. 关系发展趋势\n5. 改善关系的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'work-atmosphere',
    name: '工作氛围分析',
    content:
      '请分析这些工作群聊的氛围：\n1. 团队协作模式\n2. 沟通效率和质量\n3. 工作压力和情绪状态\n4. 团队凝聚力\n5. 改善工作氛围的建议',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Prompt操作结果
export interface PromptOperationResult {
  success: boolean
  message?: string
  data?: PromptTemplate
}

// Prompt查询选项
export interface PromptQueryOptions {
  includeBuiltIn?: boolean
  searchQuery?: string
}
