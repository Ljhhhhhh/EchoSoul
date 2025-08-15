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
    getChatroomList: () => ipcRenderer.invoke('chatlog:get-chatroom-list'),
    getWechatKey: () => ipcRenderer.invoke('chatlog:get-wechat-key'),
    checkInitialization: () => ipcRenderer.invoke('chatlog:check-initialization')
  },

  // 应用控制相关的API
  app: {
    quit: () => ipcRenderer.invoke('app:quit')
  },

  // AI服务相关的API
  aiService: {
    // 获取所有AI服务
    getAllServices: () => ipcRenderer.invoke('ai:get-services'),

    // 添加或更新AI服务
    addOrUpdateService: (config: any) => ipcRenderer.invoke('ai:add-service', config),

    // 更新AI服务
    updateService: (config: any) => ipcRenderer.invoke('ai:update-service', config),

    // 删除AI服务
    removeService: (serviceId: string) => ipcRenderer.invoke('ai:remove-service', serviceId),

    // 测试AI服务连接
    testService: (serviceId: string) => ipcRenderer.invoke('ai:test-service', serviceId),
    testTempService: (config: any) => ipcRenderer.invoke('ai:test-temp-service', config),

    // 获取服务状态
    getServiceStatus: (serviceId: string) => ipcRenderer.invoke('ai:get-service-status', serviceId),

    // 验证API密钥
    validateApiKey: (provider: string, apiKey: string, baseUrl?: string) =>
      ipcRenderer.invoke('ai:validate-api-key', provider, apiKey, baseUrl),

    // 获取可用的AI提供商
    getAvailableProviders: () => ipcRenderer.invoke('ai:get-available-providers'),

    // 发送聊天请求
    sendChatRequest: (serviceId: string, messages: any[], options?: any) =>
      ipcRenderer.invoke('ai:send-chat-request', serviceId, messages, options)
  },

  // 报告生成相关的API
  report: {
    // 生成报告
    generateReport: (config: any) => ipcRenderer.invoke('report:generate-report', config)
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
