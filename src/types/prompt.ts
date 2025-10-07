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
