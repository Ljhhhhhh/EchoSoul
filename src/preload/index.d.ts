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
  onStateChanged: (callback: (state: any) => void) => void
  onCompleted: (callback: () => void) => void
  onError: (callback: (error: any) => void) => void
  removeAllListeners: () => void
}

interface CustomAPI {
  initialization: InitializationAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
