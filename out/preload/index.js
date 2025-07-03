"use strict";
const electron = require("electron");
const electronAPI = {
  // 配置管理
  config: {
    get: () => electron.ipcRenderer.invoke("config:get"),
    set: (settings) => electron.ipcRenderer.invoke("config:set", settings),
    testApi: (provider, apiKey) => electron.ipcRenderer.invoke("config:test-api", provider, apiKey)
  },
  // chatlog服务
  chatlog: {
    status: () => electron.ipcRenderer.invoke("chatlog:status"),
    start: () => electron.ipcRenderer.invoke("chatlog:start"),
    getContacts: () => electron.ipcRenderer.invoke("chatlog:get-contacts")
  },
  // 报告管理
  report: {
    list: () => electron.ipcRenderer.invoke("report:list"),
    get: (id) => electron.ipcRenderer.invoke("report:get", id),
    generateCustom: (config) => electron.ipcRenderer.invoke("report:generate-custom", config)
  },
  // 任务状态
  task: {
    status: (taskId) => electron.ipcRenderer.invoke("task:status", taskId),
    cancel: (taskId) => electron.ipcRenderer.invoke("task:cancel", taskId)
  },
  // 事件监听
  on: (channel, callback) => {
    electron.ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  off: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  },
  // 通用调用
  invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args)
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
