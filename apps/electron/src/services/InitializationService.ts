import { createLogger } from '../utils/logger';
import { ChatlogService } from './ChatlogService';
import { ConfigService } from './ConfigService';
import { InitializationStep, InitializationState } from '@echosoul/common';
import { BrowserWindow, dialog } from 'electron';
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';

const logger = createLogger('InitializationService');

export class InitializationService {
  private chatlogService: ChatlogService;
  private configService: ConfigService;
  private mainWindow: BrowserWindow | null = null;
  private currentState: InitializationState;

  constructor(chatlogService: ChatlogService, configService: ConfigService) {
    this.chatlogService = chatlogService;
    this.configService = configService;
    this.currentState = {
      currentStep: InitializationStep.CHECKING_WECHAT,
      isCompleted: false,
      stepData: {},
    };
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  /**
   * 获取当前初始化状态
   */
  getCurrentState(): InitializationState {
    return { ...this.currentState };
  }

  /**
   * 检查是否需要初始化
   */
  async needsInitialization(): Promise<boolean> {
    try {
      // 检查是否已经完成过初始化
      const config = await this.configService.get();
      if (config.initializationCompleted) {
        this.currentState.isCompleted = true;
        this.currentState.currentStep = InitializationStep.COMPLETED;
        return false;
      }

      // 检查chatlog初始化状态
      const chatlogInit = await this.chatlogService.checkInitialization();
      if (chatlogInit.canStartServer) {
        // 如果chatlog已经可以启动，标记为完成
        await this.markInitializationCompleted();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking initialization needs:', error);
      return true;
    }
  }

  /**
   * 开始初始化流程
   */
  async startInitialization(): Promise<void> {
    logger.info('Starting initialization process');

    try {
      // 步骤1: 检查微信运行状态
      await this.checkWeChatRunning();

      // 步骤2: 获取微信密钥
      await this.getWeChatKey();

      // 步骤3: 选择工作目录
      await this.selectWorkDirectory();

      // 步骤4: 解密数据库
      await this.decryptDatabase();

      // 步骤5: 启动chatlog服务
      await this.startChatlogService();

      // 完成初始化
      await this.completeInitialization();
    } catch (error: any) {
      logger.error('Initialization failed:', error);
      this.updateStep(this.currentState.currentStep, error.message);
      throw error;
    }
  }

  /**
   * 步骤1: 检查微信运行状态
   */
  private async checkWeChatRunning(): Promise<void> {
    this.updateStep(InitializationStep.CHECKING_WECHAT);

    try {
      const isRunning = await this.isWeChatRunning();

      if (!isRunning) {
        // 显示对话框提示用户启动微信
        const result = await dialog.showMessageBox(this.mainWindow!, {
          type: 'warning',
          title: 'EchoSoul 初始化',
          message: '需要启动微信',
          detail: '请先启动微信应用，然后点击"重试"继续初始化。',
          buttons: ['重试', '退出'],
          defaultId: 0,
          cancelId: 1,
        });

        if (result.response === 1) {
          throw new Error('用户取消初始化');
        }

        // 递归重试检查
        return this.checkWeChatRunning();
      }

      this.currentState.stepData!.wechatRunning = true;
      logger.info('WeChat is running');
    } catch (error) {
      logger.error('Failed to check WeChat status:', error);
      throw error;
    }
  }

  /**
   * 步骤2: 获取微信密钥
   */
  private async getWeChatKey(): Promise<void> {
    this.updateStep(InitializationStep.GETTING_KEY);

    try {
      const result = await this.chatlogService.getWechatKey();

      if (!result.success) {
        throw new Error(`获取微信密钥失败: ${result.message}`);
      }

      this.currentState.stepData!.keyObtained = true;
      logger.info('WeChat key obtained successfully');
    } catch (error) {
      logger.error('Failed to get WeChat key:', error);
      throw error;
    }
  }

  /**
   * 步骤3: 选择工作目录
   */
  private async selectWorkDirectory(): Promise<void> {
    this.updateStep(InitializationStep.SELECTING_WORKDIR);

    try {
      // 提供默认路径
      const defaultPath = path.join(
        os.homedir(),
        'Documents',
        'EchoSoul',
        'chatlog_data'
      );

      const result = await dialog.showOpenDialog(this.mainWindow!, {
        title: '选择聊天记录存储目录',
        message: '请选择用于存储解密后聊天记录的目录',
        defaultPath: defaultPath,
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: '选择目录',
      });

      if (result.canceled || !result.filePaths.length) {
        throw new Error('用户取消目录选择');
      }

      const selectedPath = result.filePaths[0];
      this.currentState.stepData!.workDir = selectedPath;

      // 更新ChatlogService的工作目录
      this.chatlogService.setWorkDirectory(selectedPath);

      logger.info(`Work directory selected: ${selectedPath}`);
    } catch (error) {
      logger.error('Failed to select work directory:', error);
      throw error;
    }
  }

  /**
   * 步骤4: 解密数据库
   */
  private async decryptDatabase(): Promise<void> {
    this.updateStep(InitializationStep.DECRYPTING_DATABASE);

    try {
      const result = await this.chatlogService.decryptDatabase();

      if (!result.success) {
        throw new Error(`数据库解密失败: ${result.message}`);
      }

      this.currentState.stepData!.databaseDecrypted = true;
      logger.info('Database decrypted successfully');
    } catch (error) {
      logger.error('Failed to decrypt database:', error);
      throw error;
    }
  }

  /**
   * 步骤5: 启动chatlog服务
   */
  private async startChatlogService(): Promise<void> {
    this.updateStep(InitializationStep.STARTING_SERVICE);

    try {
      const result = await this.chatlogService.startService();

      if (!result) {
        throw new Error('Chatlog服务启动失败');
      }

      this.currentState.stepData!.serviceStarted = true;
      logger.info('Chatlog service started successfully');
    } catch (error) {
      logger.error('Failed to start chatlog service:', error);
      throw error;
    }
  }

  /**
   * 完成初始化
   */
  private async completeInitialization(): Promise<void> {
    this.updateStep(InitializationStep.COMPLETED);

    this.currentState.isCompleted = true;
    await this.markInitializationCompleted();

    logger.info('Initialization completed successfully');
  }

  /**
   * 标记初始化完成
   */
  private async markInitializationCompleted(): Promise<void> {
    try {
      const config = await this.configService.get();
      config.initializationCompleted = true;
      if (this.currentState.stepData?.workDir) {
        config.chatlogWorkDir = this.currentState.stepData.workDir;
      }
      await this.configService.set(config);
    } catch (error) {
      logger.error('Failed to mark initialization as completed:', error);
    }
  }

  /**
   * 更新当前步骤并通知渲染进程
   */
  private updateStep(step: InitializationStep, error?: string): void {
    this.currentState.currentStep = step;
    this.currentState.error = error;

    // 通知渲染进程
    if (this.mainWindow) {
      this.mainWindow.webContents.send(
        'initialization:step-update',
        step,
        error
      );
    }

    logger.info(
      `Initialization step updated: ${step}${error ? ` (error: ${error})` : ''}`
    );
  }

  /**
   * 检查微信是否运行
   */
  private async isWeChatRunning(): Promise<boolean> {
    if (process.platform !== 'darwin') {
      // 暂时只支持macOS
      return true;
    }

    return new Promise(resolve => {
      const { exec } = require('child_process');
      exec('pgrep -f "WeChat|Weixin"', (error: any, stdout: string) => {
        if (error) {
          resolve(false);
          return;
        }

        const pids = stdout
          .trim()
          .split('\n')
          .filter(line => line.trim());
        resolve(pids.length > 0);
      });
    });
  }
}
