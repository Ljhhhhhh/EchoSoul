import { ipcMain } from 'electron';
import { AppServices } from '../services/AppServices';
import { createLogger } from '../utils/logger';
import type {
  UserSettings,
  AnalysisConfig,
  InitializationState,
} from '@echosoul/common';

const logger = createLogger('IPC');

export function setupIpcHandlers(services: AppServices) {
  logger.info('Setting up IPC handlers');

  // 配置管理
  ipcMain.handle('config:get', async (): Promise<UserSettings> => {
    try {
      return await services.config.get();
    } catch (error) {
      logger.error('Failed to get config:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'config:set',
    async (_, settings: Partial<UserSettings>): Promise<void> => {
      try {
        await services.config.set(settings);
      } catch (error) {
        logger.error('Failed to set config:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'config:test-api',
    async (_, provider: string, apiKey: string): Promise<boolean> => {
      try {
        return await services.config.testApiKey(provider, apiKey);
      } catch (error) {
        logger.error('Failed to test API key:', error);
        return false;
      }
    }
  );

  // chatlog服务
  ipcMain.handle('chatlog:status', async () => {
    try {
      return await services.chatlog.checkStatus();
    } catch (error) {
      logger.error('Failed to check chatlog status:', error);
      return 'error';
    }
  });

  ipcMain.handle('chatlog:start', async (): Promise<boolean> => {
    try {
      return await services.chatlog.startService();
    } catch (error) {
      logger.error('Failed to start chatlog service:', error);
      return false;
    }
  });

  ipcMain.handle('chatlog:stop', async (): Promise<void> => {
    try {
      await services.chatlog.stopService();
    } catch (error) {
      logger.error('Failed to stop chatlog service:', error);
    }
  });

  ipcMain.handle('chatlog:get-contacts', async () => {
    try {
      return await services.chatlog.getContacts();
    } catch (error) {
      logger.error('Failed to get contacts:', error);
      return [];
    }
  });

  ipcMain.handle('chatlog:get-wechat-key', async () => {
    try {
      return await services.chatlog.getWechatKey();
    } catch (error) {
      logger.error('Failed to get WeChat key:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('chatlog:decrypt-database', async () => {
    try {
      return await services.chatlog.decryptDatabase();
    } catch (error) {
      logger.error('Failed to decrypt database:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('chatlog:check-initialization', async () => {
    try {
      return await services.chatlog.checkInitialization();
    } catch (error) {
      logger.error('Failed to check chatlog initialization:', error);
      return {
        keyObtained: false,
        databaseDecrypted: false,
        canStartServer: false,
      };
    }
  });

  // 报告管理
  ipcMain.handle('report:list', async () => {
    try {
      return await services.report.getReports();
    } catch (error) {
      logger.error('Failed to get reports:', error);
      return [];
    }
  });

  ipcMain.handle(
    'report:get',
    async (_, id: string): Promise<string | null> => {
      try {
        return await services.report.getReportContent(id);
      } catch (error) {
        logger.error('Failed to get report content:', error);
        return null;
      }
    }
  );

  ipcMain.handle(
    'report:generate-custom',
    async (_, config: AnalysisConfig): Promise<string> => {
      try {
        return await services.report.generateCustomReport(config);
      } catch (error) {
        logger.error('Failed to generate custom report:', error);
        throw error;
      }
    }
  );

  // 任务状态
  ipcMain.handle('task:status', async (_, taskId: string) => {
    try {
      return await services.report.getTaskStatus(taskId);
    } catch (error) {
      logger.error('Failed to get task status:', error);
      return null;
    }
  });

  ipcMain.handle('task:cancel', async (_, taskId: string): Promise<void> => {
    try {
      // TODO: 实现任务取消逻辑
      logger.info(`Cancelling task: ${taskId}`);
    } catch (error) {
      logger.error('Failed to cancel task:', error);
      throw error;
    }
  });

  // 初始化管理
  ipcMain.handle(
    'initialization:get-state',
    async (): Promise<InitializationState> => {
      try {
        return services.initialization.getCurrentState();
      } catch (error) {
        logger.error('Failed to get initialization state:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'initialization:needs-initialization',
    async (): Promise<boolean> => {
      try {
        return await services.initialization.needsInitialization();
      } catch (error) {
        logger.error('Failed to check initialization needs:', error);
        return true;
      }
    }
  );

  ipcMain.handle('initialization:start', async (): Promise<void> => {
    try {
      await services.initialization.startInitialization();
    } catch (error) {
      logger.error('Failed to start initialization:', error);
      throw error;
    }
  });

  // 开发和调试用的IPC处理器
  if (process.env.NODE_ENV === 'development') {
    ipcMain.handle('dev:trigger-daily-report', async () => {
      try {
        await services.scheduler.triggerDailyReport();
        return true;
      } catch (error) {
        logger.error('Failed to trigger daily report:', error);
        return false;
      }
    });
  }

  logger.info('IPC handlers setup completed');
}
