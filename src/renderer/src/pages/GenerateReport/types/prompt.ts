/**
 * Prompt模板相关类型定义
 */

export interface PromptTemplate {
  id: string
  name: string
  content: string
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

export interface PromptState {
  prompts: PromptTemplate[]
  selectedPrompt: PromptTemplate | null
  isLoading: boolean
  error: string | null
}

export interface PromptActions {
  selectPrompt: (prompt: PromptTemplate | null) => void
  loadPrompts: () => Promise<void>
  createPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePrompt: (id: string, prompt: Partial<PromptTemplate>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
}
