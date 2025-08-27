import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 初始化相关的API
  initialization: {
    start: () => ipcRenderer.invoke('initialization:start'),
    getState: () => ipcRenderer.invoke('initialization:getState'),
    retryFromStep: (step: string) => ipcRenderer.invoke('initialization:retryFromStep', step),
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
    checkInitialization: () => ipcRenderer.invoke('chatlog:check-initialization'),
    getLastUpdateTime: () => ipcRenderer.invoke('chatlog:get-last-update-time')
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

  // ... existing code ...
  // 提示词管理相关的API
  prompt: {
    // 获取所有提示词
    getAll: (options?: any) => ipcRenderer.invoke('prompt:getAll', options),
    // 根据ID获取提示词
    getById: (id: string) => ipcRenderer.invoke('prompt:getById', id),
    // 创建新提示词
    create: (data: any) => ipcRenderer.invoke('prompt:create', data),
    // 更新提示词
    update: (id: string, updates: any) => ipcRenderer.invoke('prompt:update', id, updates),
    // 删除提示词
    delete: (id: string) => ipcRenderer.invoke('prompt:delete', id),
    // 复制提示词
    duplicate: (id: string) => ipcRenderer.invoke('prompt:duplicate', id),
    // 获取用户自定义提示词
    getUserPrompts: () => ipcRenderer.invoke('prompt:getUserPrompts'),
    // 获取内置提示词
    getBuiltInPrompts: () => ipcRenderer.invoke('prompt:getBuiltInPrompts'),
    // 搜索提示词
    search: (query: string) => ipcRenderer.invoke('prompt:search', query),
    // 验证提示词数据
    validate: (data: any) => ipcRenderer.invoke('prompt:validate', data),
    // 获取统计信息
    getStats: () => ipcRenderer.invoke('prompt:getStats')
  },

  // 报告生成相关的API
  report: {
    // 生成报告
    generateReport: (config: any) => ipcRenderer.invoke('report:generate-report', config),
    // 获取报告列表
    getReports: () => ipcRenderer.invoke('report:list'),
    // 获取报告详情
    getReport: (id: string) => ipcRenderer.invoke('report:get', id),
    // 删除报告
    deleteReport: (id: string) => ipcRenderer.invoke('report:delete', id)
  },

  // 任务状态管理相关的API
  task: {
    // 获取任务状态
    getStatus: (taskId: string) => ipcRenderer.invoke('task:status', taskId),
    // 取消任务
    cancel: (taskId: string) => ipcRenderer.invoke('task:cancel', taskId),
    // 获取任务列表
    list: () => ipcRenderer.invoke('task:list'),
    // 获取任务统计
    getStats: () => ipcRenderer.invoke('task:stats')
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
