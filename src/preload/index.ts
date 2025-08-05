import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 初始化相关的API
  initialization: {
    start: () => ipcRenderer.invoke('initialization:start'),
    getState: () => ipcRenderer.invoke('initialization:getState'),
    retryFromStep: (step: string) => ipcRenderer.invoke('initialization:retryFromStep', step),
    selectWorkDir: () => ipcRenderer.invoke('initialization:selectWorkDir'),
    getDiagnostics: () => ipcRenderer.invoke('initialization:getDiagnostics'),
    hasDecryptedData: () => ipcRenderer.invoke('initialization:hasDecryptedData'),

    // 事件监听
    onStateChanged: (callback: (state: any) => void) => {
      ipcRenderer.on('initialization:stateChanged', (_, state) => callback(state))
    },
    onCompleted: (callback: () => void) => {
      ipcRenderer.on('initialization:completed', () => callback())
    },
    onError: (callback: (error: any) => void) => {
      ipcRenderer.on('initialization:error', (_, error) => callback(error))
    },

    // 移除事件监听器
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('initialization:stateChanged')
      ipcRenderer.removeAllListeners('initialization:completed')
      ipcRenderer.removeAllListeners('initialization:error')
    }
  },

  // chatlog相关的API
  chatlog: {
    decryptDatabase: () => ipcRenderer.invoke('chatlog:decrypt-database'),
    status: () => ipcRenderer.invoke('chatlog:status'),
    start: () => ipcRenderer.invoke('chatlog:start'),
    stop: () => ipcRenderer.invoke('chatlog:stop'),
    getContacts: () => ipcRenderer.invoke('chatlog:get-contacts'),
    getWechatKey: () => ipcRenderer.invoke('chatlog:get-wechat-key'),
    checkInitialization: () => ipcRenderer.invoke('chatlog:check-initialization')
  },

  // 应用控制相关的API
  app: {
    quit: () => ipcRenderer.invoke('app:quit')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
