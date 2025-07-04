import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { AppServices } from './services/AppServices';
import { setupIpcHandlers } from './ipc/handlers';
import { createLogger } from './utils/logger';

const logger = createLogger('main');

class EchoSoulApp {
  private mainWindow: BrowserWindow | null = null;
  private services: AppServices | null = null;

  async initialize() {
    logger.info('Initializing EchoSoul application');

    // 初始化服务
    this.services = new AppServices();
    await this.services.initialize();

    // 设置IPC处理器
    setupIpcHandlers(this.services);

    // 创建主窗口
    await this.createMainWindow();

    logger.info('EchoSoul application initialized successfully');
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
      },
      titleBarStyle: 'hiddenInset',
      show: true,
    });

    // 开发环境加载本地服务器，生产环境加载打包文件
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      // 尝试多个端口，因为Vite可能会使用不同的端口
      const ports = [5173, 5174, 5175, 5176];
      let loaded = false;

      for (const port of ports) {
        try {
          await this.mainWindow.loadURL(`http://localhost:${port}`);
          logger.info(`Successfully loaded renderer from port ${port}`);
          loaded = true;
          break;
        } catch (error) {
          logger.debug(`Failed to load from port ${port}:`, error);
        }
      }

      if (!loaded) {
        logger.error('Failed to load renderer from any port');
        throw new Error('Could not connect to development server');
      }

      this.mainWindow.webContents.openDevTools();
    } else {
      // electron-vite构建后的路径
      await this.mainWindow.loadFile(
        path.join(__dirname, '../renderer/index.html')
      );
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
      logger.info('Main window shown and focused');
    });

    // 强制显示窗口（调试用）
    setTimeout(() => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
        this.mainWindow.moveTop();
        logger.info('Force showing main window');
      }
    }, 2000);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  getMainWindow() {
    return this.mainWindow;
  }

  getServices() {
    return this.services;
  }
}

// 全局应用实例
const echoSoulApp = new EchoSoulApp();

// Electron应用事件处理
app.whenReady().then(async () => {
  await echoSoulApp.initialize();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await echoSoulApp.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  logger.info('Application is quitting, cleaning up...');
  // 清理资源
  const services = echoSoulApp.getServices();
  if (services) {
    await services.cleanup();
  }
});

// 导出应用实例供其他模块使用
export { echoSoulApp };
