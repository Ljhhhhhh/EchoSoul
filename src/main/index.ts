import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { createLogger } from './utils/logger'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { AppServices } from './services/AppServices'
import { getIconPath } from './utils/resources'

import { setupIpcHandlers } from './ipc/handlers'
import { registerInitializationHandlers, cleanupInitializationManager } from './ipc/initialization'

const logger = createLogger('main')

/**
 * 检查并自动启动chatlog服务
 */
async function checkAndAutoStartChatlogService(appServices: AppServices): Promise<void> {
  try {
    // 检查初始化状态
    const initStatus = await appServices.chatlog.checkInitialization()
    const { keyObtained, databaseDecrypted, canStartServer } = initStatus

    // 只有在可以启动服务时才启动
    if (canStartServer) {
      const startResult = await appServices.chatlog.startService()
      if (startResult) {
        logger.info('Chatlog service auto-started successfully')
      } else {
        logger.warn('Failed to auto-start chatlog service')
      }
    } else if (!keyObtained || !databaseDecrypted) {
      logger.info('Initialization not completed, skipping auto-start')
    } else {
      logger.info('Chatlog service is already running')
    }
  } catch (error) {
    logger.error('Error during chatlog service auto-start check:', error)
  }
}

// 初始化服务
const appServices = new AppServices()

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    // titleBarStyle: 'hidden',

    ...(process.platform === 'linux' ? { icon: getIconPath() } : {}),
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

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.echosoul')

    logger.info('Initializing EchoSoul application')

    await appServices.initialize()
    logger.info('AppServices initialization completed, proceeding to setup IPC handlers...')

    // 设置IPC处理器
    setupIpcHandlers(appServices)
    logger.info('IPC handlers setup completed, proceeding to auto-start check...')

    // 检查并自动启动chatlog服务
    logger.info('About to check and auto-start chatlog service...')
    await checkAndAutoStartChatlogService(appServices)
    logger.info('Chatlog service auto-start check completed')

    // 注册初始化处理器
    registerInitializationHandlers()
  } catch (error) {
    logger.error('Error during app initialization:', error)
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const mainWindow = createWindow()
  appServices.registerMainWindow(mainWindow)

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
