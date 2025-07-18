import { ipcMain, dialog, BrowserWindow } from 'electron'
import { createLogger } from '../utils/logger'
import { ProcessUtils } from '../utils/processUtils'
import { InitializationManager } from '../services/InitializationManager'
import { ConfigService } from '../services/ConfigService'
import {
  InitializationState,
  InitializationStep
  // InitializationConfig - 暂未使用
} from '../types/initialization'

const logger = createLogger('InitializationIPC')

let initializationManager: InitializationManager | null = null
let configService: ConfigService | null = null

/**
 * 注册初始化相关的 IPC 处理器
 */
export function registerInitializationHandlers(): void {
  // 开始初始化
  ipcMain.handle('initialization:start', async () => {
    try {
      if (!initializationManager) {
        // 创建 ConfigService 实例（如果还没有）
        if (!configService) {
          configService = new ConfigService()
          await configService.initialize()
        }

        initializationManager = new InitializationManager(configService)

        // 监听状态变化
        initializationManager.on('stateChanged', (state: InitializationState) => {
          // 向所有窗口广播状态变化
          BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send('initialization:stateChanged', state)
          })
        })

        // 监听完成事件
        initializationManager.on('completed', () => {
          BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send('initialization:completed')
          })
        })

        // 监听错误事件
        initializationManager.on('error', (error: any) => {
          BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send('initialization:error', error)
          })
        })
      }

      await initializationManager.startInitialization()
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to start initialization:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取当前状态
  ipcMain.handle('initialization:getState', () => {
    if (!initializationManager) {
      return null
    }
    return initializationManager.getState()
  })

  // 重试当前步骤
  ipcMain.handle('initialization:retryCurrentStep', async () => {
    try {
      if (!initializationManager) {
        throw new Error('Initialization manager not initialized')
      }
      await initializationManager.retryCurrentStep()
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to retry current step:', error)
      return { success: false, error: error.message }
    }
  })

  // 从指定步骤重试
  ipcMain.handle('initialization:retryFromStep', async (_, step: InitializationStep) => {
    try {
      if (!initializationManager) {
        throw new Error('Initialization manager not initialized')
      }
      await initializationManager.retryFromStep(step)
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to retry from step:', error)
      return { success: false, error: error.message }
    }
  })

  // 选择工作目录
  ipcMain.handle('initialization:selectWorkDir', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: '选择数据保存目录',
        message: '请选择一个目录来保存解密后的微信数据',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: '选择此目录'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true }
      }

      const selectedPath = result.filePaths[0]

      // 设置工作目录
      if (initializationManager) {
        initializationManager.setWorkDir(selectedPath)
      }

      return { success: true, path: selectedPath }
    } catch (error: any) {
      logger.error('Failed to select work directory:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取配置
  ipcMain.handle('initialization:getConfig', () => {
    if (!initializationManager) {
      return {}
    }
    return initializationManager.getConfig()
  })

  // 清除配置
  ipcMain.handle('initialization:clearConfig', () => {
    try {
      if (initializationManager) {
        initializationManager.clearConfig()
      }
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to clear config:', error)
      return { success: false, error: error.message }
    }
  })

  // 检查微信状态
  ipcMain.handle('initialization:checkWeChat', async () => {
    try {
      const pids = await ProcessUtils.findWeChatProcesses()
      return { isRunning: pids.length > 0, processIds: pids }
    } catch (error: any) {
      logger.error('检查微信状态时出错:', error)
      return { isRunning: false, processIds: [] }
    }
  })

  // 强制退出初始化（仅开发模式）
  ipcMain.handle('initialization:forceExit', () => {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Force exiting initialization (development mode)')
      if (initializationManager) {
        initializationManager.removeAllListeners()
        initializationManager = null
      }
      return { success: true }
    }
    return { success: false, error: 'Not allowed in production' }
  })

  // 获取诊断信息
  ipcMain.handle('initialization:getDiagnostics', async () => {
    try {
      const { ChatlogDiagnostics } = await import('../utils/ChatlogDiagnostics')
      const diagnostics = new ChatlogDiagnostics()
      const results = await diagnostics.runFullDiagnostics()
      const report = diagnostics.generateReport(results)

      return { success: true, results, report }
    } catch (error: any) {
      logger.error('Failed to get diagnostics:', error)
      return { success: false, error: error.message }
    }
  })

  logger.info('Initialization IPC handlers registered')
}

/**
 * 清理初始化管理器
 */
export function cleanupInitializationManager(): void {
  if (initializationManager) {
    initializationManager.removeAllListeners()
    initializationManager = null
    logger.info('Initialization manager cleaned up')
  }
}

/**
 * 获取初始化管理器实例
 */
export function getInitializationManager(): InitializationManager | null {
  return initializationManager
}
