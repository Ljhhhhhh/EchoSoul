import { contextBridge, ipcRenderer } from 'electron';
import type { 
  UserSettings, 
  ReportMeta, 
  AnalysisConfig, 
  TaskStatus, 
  Contact,
  ChatlogStatus 
} from '@echosoul/common';

// IPC API定义
const electronAPI = {
  // 配置管理
  config: {
    get: (): Promise<UserSettings> => ipcRenderer.invoke('config:get'),
    set: (settings: Partial<UserSettings>): Promise<void> => 
      ipcRenderer.invoke('config:set', settings),
    testApi: (provider: string, apiKey: string): Promise<boolean> => 
      ipcRenderer.invoke('config:test-api', provider, apiKey),
  },

  // chatlog服务
  chatlog: {
    status: (): Promise<ChatlogStatus> => ipcRenderer.invoke('chatlog:status'),
    start: (): Promise<boolean> => ipcRenderer.invoke('chatlog:start'),
    getContacts: (): Promise<Contact[]> => ipcRenderer.invoke('chatlog:get-contacts'),
  },

  // 报告管理
  report: {
    list: (): Promise<ReportMeta[]> => ipcRenderer.invoke('report:list'),
    get: (id: string): Promise<string> => ipcRenderer.invoke('report:get', id),
    generateCustom: (config: AnalysisConfig): Promise<string> => 
      ipcRenderer.invoke('report:generate-custom', config),
  },

  // 任务状态
  task: {
    status: (taskId: string): Promise<TaskStatus> => 
      ipcRenderer.invoke('task:status', taskId),
    cancel: (taskId: string): Promise<void> => 
      ipcRenderer.invoke('task:cancel', taskId),
  },

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // 通用调用
  invoke: (channel: string, ...args: any[]): Promise<any> => 
    ipcRenderer.invoke(channel, ...args),
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
