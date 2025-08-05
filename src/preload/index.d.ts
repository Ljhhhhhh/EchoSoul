import { ElectronAPI } from '@electron-toolkit/preload'

interface InitializationAPI {
  start: () => Promise<{ success: boolean; error?: string }>
  getState: () => Promise<any>
  retryFromStep: (step: string) => Promise<{ success: boolean; error?: string }>
  selectWorkDir: () => Promise<{ success: boolean; workDir?: string; error?: string }>
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
  getContacts: () => Promise<{ success: boolean; contacts?: any; error?: string }>
  getWechatKey: () => Promise<{ success: boolean; wechatKey?: string; error?: string }>
  checkInitialization: () => Promise<{
    keyObtained: boolean
    databaseDecrypted: boolean
    canStartServer: boolean
  }>
}

interface AppAPI {
  quit: () => Promise<void>
}

interface CustomAPI {
  initialization: InitializationAPI
  chatlog: ChatlogAPI
  app: AppAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
