import { ElectronAPI } from '@electron-toolkit/preload'
import { Contact } from '@/types/contact'

interface InitializationAPI {
  start: () => Promise<{ success: boolean; error?: string }>
  getState: () => Promise<any>
  retryFromStep: (step: string) => Promise<{ success: boolean; error?: string }>
  getDiagnostics: () => Promise<{
    success: boolean
    results?: any
    report?: string
    error?: string
  }>
  hasDecryptedData: () => Promise<boolean>
  onStateChanged: (callback: (state: any) => void) => void
  onCompleted: (callback: () => void) => void
  onError: (callback: (error: any) => void) => void
  removeAllListeners: () => void
}

interface ChatlogAPI {
  decryptDatabase: () => Promise<{ success: boolean; message?: string; error?: string }>
  status: () => Promise<string>
  start: () => Promise<boolean>
  stop: () => Promise<boolean>
  getContacts: () => Promise<Contact[]>
  getChatroomList: () => Promise<any[]>
  getWechatKey: () => Promise<{ success: boolean; wechatKey?: string; error?: string }>
  checkInitialization: () => Promise<{
    keyObtained: boolean
    databaseDecrypted: boolean
    canStartServer: boolean
  }>
  getLastUpdateTime: () => Promise<string | undefined>
}

interface AppAPI {
  quit: () => Promise<void>
}

interface AIServiceAPI {
  getAllServices: () => Promise<any[]>
  addOrUpdateService: (config: any) => Promise<void>
  updateService: (config: any) => Promise<void>
  removeService: (serviceId: string) => Promise<void>
  testService: (config: any) => Promise<{ success: boolean; error?: string; details?: any }>
  testTempService: (config: any) => Promise<{ success: boolean; error?: string; details?: any }>
  getServiceStatus: (serviceId: string) => Promise<any>
  validateApiKey: (
    provider: string,
    apiKey: string,
    baseUrl?: string
  ) => Promise<{ valid: boolean; error?: string }>
  getAvailableProviders: () => Promise<string[]>
  sendChatRequest: (serviceId: string, messages: any[], options?: any) => Promise<any>
}

interface ReportAPI {
  generateReport: (config: any) => Promise<any>
  getReports: () => Promise<any[]>
  getReport: (id: string) => Promise<any>
  deleteReport: (id: string) => Promise<void>
}

interface TaskAPI {
  getStatus: (taskId: string) => Promise<any>
  cancel: (taskId: string) => Promise<void>
  list: () => Promise<any[]>
  getStats: () => Promise<any>
}

interface PromptAPI {
  getAll: (options?: any) => Promise<any[]>
  getById: (id: string) => Promise<any | null>
  create: (data: any) => Promise<{ success: boolean; message?: string; data?: any }>
  update: (id: string, updates: any) => Promise<{ success: boolean; message?: string; data?: any }>
  delete: (id: string) => Promise<{ success: boolean; message?: string }>
  duplicate: (id: string) => Promise<{ success: boolean; message?: string; data?: any }>
  getUserPrompts: () => Promise<any[]>
  getBuiltInPrompts: () => Promise<any[]>
  search: (query: string) => Promise<any[]>
  validate: (data: any) => Promise<{ valid: boolean; errors?: string[] }>
  getStats: () => Promise<{ total: number; userCreated: number; builtIn: number }>
}

interface CustomAPI {
  initialization: InitializationAPI
  chatlog: ChatlogAPI
  app: AppAPI
  aiService: AIServiceAPI
  prompt: PromptAPI
  report: ReportAPI
  task: TaskAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
