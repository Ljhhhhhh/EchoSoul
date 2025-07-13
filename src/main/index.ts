import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { createLogger } from './utils/logger'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { AppServices } from './services/AppServices'
import icon from '../../resources/icon.png?asset'

import { setupIpcHandlers } from './ipc/handlers'
import { registerInitializationHandlers, cleanupInitializationManager } from './ipc/initialization'

const logger = createLogger('main')

// 初始化服务
const appServices = new AppServices()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.echosoul')

  logger.info('Initializing EchoSoul application')

  await appServices.initialize()

  // 设置IPC处理器
  setupIpcHandlers(appServices)

  // 注册初始化处理器
  registerInitializationHandlers()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  logger.info('Application is quitting, cleaning up...')
  // 清理资源
  if (appServices) {
    await appServices.cleanup()
  }

  // 清理初始化管理器
  cleanupInitializationManager()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
