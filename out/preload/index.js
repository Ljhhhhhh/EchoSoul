"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // 初始化相关的API
  initialization: {
    start: () => electron.ipcRenderer.invoke("initialization:start"),
    getState: () => electron.ipcRenderer.invoke("initialization:getState"),
    retryFromStep: (step) => electron.ipcRenderer.invoke("initialization:retryFromStep", step),
    selectWorkDir: () => electron.ipcRenderer.invoke("initialization:selectWorkDir"),
    getDiagnostics: () => electron.ipcRenderer.invoke("initialization:getDiagnostics"),
    // 事件监听
    onStateChanged: (callback) => {
      electron.ipcRenderer.on("initialization:stateChanged", (_, state) => callback(state));
    },
    onCompleted: (callback) => {
      electron.ipcRenderer.on("initialization:completed", () => callback());
    },
    onError: (callback) => {
      electron.ipcRenderer.on("initialization:error", (_, error) => callback(error));
    },
    // 移除事件监听器
    removeAllListeners: () => {
      electron.ipcRenderer.removeAllListeners("initialization:stateChanged");
      electron.ipcRenderer.removeAllListeners("initialization:completed");
      electron.ipcRenderer.removeAllListeners("initialization:error");
    }
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
