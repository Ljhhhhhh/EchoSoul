import type { 
  UserSettings, 
  ReportMeta, 
  AnalysisConfig, 
  TaskStatus, 
  Contact,
  ChatlogStatus 
} from '@echosoul/common';

declare global {
  interface Window {
    electronAPI: {
      // 配置管理
      config: {
        get: () => Promise<UserSettings>;
        set: (settings: Partial<UserSettings>) => Promise<void>;
        testApi: (provider: string, apiKey: string) => Promise<boolean>;
      };

      // chatlog服务
      chatlog: {
        status: () => Promise<ChatlogStatus>;
        start: () => Promise<boolean>;
        getContacts: () => Promise<Contact[]>;
      };

      // 报告管理
      report: {
        list: () => Promise<ReportMeta[]>;
        get: (id: string) => Promise<string>;
        generateCustom: (config: AnalysisConfig) => Promise<string>;
      };

      // 任务状态
      task: {
        status: (taskId: string) => Promise<TaskStatus>;
        cancel: (taskId: string) => Promise<void>;
      };

      // 事件监听
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;

      // 通用调用
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export {};
