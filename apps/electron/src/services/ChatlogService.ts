import { createLogger } from '../utils/logger';
import type { ChatMessage, Contact, ChatlogStatus } from '@echosoul/common';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { setExecutablePermission } from '../utils';
import { ChatlogHttpClient } from './ChatlogHttpClient';
import Store from 'electron-store';

const logger = createLogger('ChatlogService');

interface ChatlogConfig {
  wechatKey?: string;
  workDir?: string;
  baseUrl?: string;
}

export class ChatlogService {
  private baseUrl = 'http://127.0.0.1:5030'; // chatlog默认端口
  private chatlogProcess: ChildProcess | null = null;
  private chatlogPath: string;
  private isInitialized = false;
  private httpClient: ChatlogHttpClient;
  private store: Store<ChatlogConfig>;

  // 从配置中加载的微信密钥
  private wechatKey: string = '';

  constructor() {
    // 初始化配置存储
    this.store = new Store<ChatlogConfig>({
      name: 'chatlog-config',
      defaults: {
        baseUrl: this.baseUrl,
      },
    });

    // 从配置中加载设置
    const savedBaseUrl = this.store.get('baseUrl');
    if (savedBaseUrl) {
      this.baseUrl = savedBaseUrl;
    }

    const savedKey = this.store.get('wechatKey');
    if (savedKey) {
      this.wechatKey = savedKey;
    }

    // 初始化 HTTP 客户端
    this.httpClient = new ChatlogHttpClient(this.baseUrl);

    // 根据平台选择对应的chatlog可执行文件
    const platform = process.platform;

    // 在开发环境中，从项目根目录查找resource
    // 在生产环境中，从app.asar.unpacked查找
    let resourcesPath: string;
    if (app.isPackaged) {
      resourcesPath = path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'apps',
        'electron',
        'resource'
      );
    } else {
      // 开发环境：从当前工作目录查找
      resourcesPath = path.join(process.cwd(), 'apps', 'electron', 'resource');
    }

    if (platform === 'darwin') {
      this.chatlogPath = path.join(resourcesPath, 'chatlog_mac', 'chatlog');
    } else if (platform === 'win32') {
      this.chatlogPath = path.join(
        resourcesPath,
        'chatlog_windows',
        'chatlog.exe'
      );
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async initialize() {
    try {
      // 检查chatlog可执行文件是否存在
      if (!fs.existsSync(this.chatlogPath)) {
        throw new Error(`Chatlog executable not found at: ${this.chatlogPath}`);
      }

      // 在macOS上设置执行权限
      if (process.platform === 'darwin') {
        await this.setExecutablePermission();
      }

      logger.info(
        `ChatlogService initialized with executable: ${this.chatlogPath}`
      );
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize ChatlogService:', error);
      throw error;
    }
  }

  private async setExecutablePermission(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(`chmod +x "${this.chatlogPath}"`, (error: any) => {
        if (error) {
          logger.error('Failed to set executable permission:', error);
          reject(error);
        } else {
          logger.info('Executable permission set successfully');
          resolve();
        }
      });
    });
  }

  /**
   * 获取chatlog解密后的数据目录
   * 优先使用用户选择的目录，否则使用默认目录
   */
  private getChatlogDataDir(): string {
    const os = require('os');
    const homeDir = os.homedir();

<<<<<<< HEAD
    // TODO: 需要更新为可选的目录
    // 使用固定的解密数据目录
    const dataDir = path.join(homeDir, 'Documents', 'EchoSoul', 'chatlog_data');
=======
    // 优先使用用户配置的工作目录
    const savedWorkDir = this.store.get('workDir');
    const workDir =
      savedWorkDir ||
      path.join(homeDir, 'Documents', 'EchoSoul', 'chatlog_data');
>>>>>>> fa608a516bdb2e31ac2a69cf37db16759a82f9eb

    // 确保目录存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Created chatlog data directory: ${dataDir}`);
    }

<<<<<<< HEAD
    return dataDir;
=======
    return workDir;
  }

  /**
   * 设置工作目录
   */
  setWorkDir(workDir: string): void {
    this.store.set('workDir', workDir);
    logger.info(`Work directory set to: ${workDir}`);
  }

  /**
   * 获取当前工作目录
   */
  getWorkDir(): string {
    return this.getChatlogWorkDir();
  }

  /**
   * 动态检测微信数据目录
   * 基于chatlog源码的实现，通过lsof命令检测微信进程打开的文件
   */
  private async detectWeChatDataPath(): Promise<string | null> {
    if (process.platform !== 'darwin') {
      return null;
    }

    try {
      // 查找微信进程
      const wechatPids = await this.findWeChatProcesses();
      if (wechatPids.length === 0) {
        logger.warn('No WeChat process found');
        return null;
      }

      // 对每个微信进程，使用lsof获取打开的文件
      for (const pid of wechatPids) {
        const dataPath = await this.getWeChatDataPathFromProcess(pid);
        if (dataPath) {
          return dataPath;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error detecting WeChat data path:', error);
      return null;
    }
  }

  /**
   * 查找微信进程PID
   */
  private async findWeChatProcesses(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');

      // 查找WeChat和Weixin进程
      exec('pgrep -f "WeChat|Weixin"', (error: any, stdout: string) => {
        if (error) {
          // pgrep没找到进程时会返回错误，这是正常的
          resolve([]);
          return;
        }

        const pids = stdout
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(pid => parseInt(pid.trim()))
          .filter(pid => !isNaN(pid));

        resolve(pids);
      });
    });
  }

  /**
   * 从微信进程获取数据路径
   */
  private async getWeChatDataPathFromProcess(
    pid: number
  ): Promise<string | null> {
    return new Promise(resolve => {
      const { exec } = require('child_process');

      // 使用lsof获取进程打开的文件
      exec(`lsof -p ${pid} -F n`, (error: any, stdout: string) => {
        if (error) {
          resolve(null);
          return;
        }

        const files = stdout
          .split('\n')
          .filter(line => line.startsWith('n'))
          .map(line => line.substring(1)); // 移除前缀'n'

        // 查找包含msg_0.db或session.db的路径
        for (const filePath of files) {
          if (
            filePath.includes('Message/msg_0.db') ||
            filePath.includes('db_storage/session/session.db')
          ) {
            // 提取数据目录路径
            const pathParts = filePath.split(path.sep);

            if (filePath.includes('Message/msg_0.db')) {
              // v3版本: .../2.0b4.0.9/{用户ID}/Message/msg_0.db
              const dataDir = pathParts.slice(0, -2).join(path.sep);
              logger.info(`Detected WeChat v3 data directory: ${dataDir}`);
              resolve(dataDir);
              return;
            } else if (filePath.includes('db_storage/session/session.db')) {
              // v4版本: .../{用户ID}/db_storage/session/session.db
              const dataDir = pathParts.slice(0, -3).join(path.sep);
              logger.info(`Detected WeChat v4 data directory: ${dataDir}`);
              resolve(dataDir);
              return;
            }
          }
        }

        resolve(null);
      });
    });
  }

  /**
   * 检测微信版本
   */
  private async detectWeChatVersion(dataPath: string): Promise<number> {
    try {
      // 检查是否存在v4版本的特征文件
      const v4Indicators = ['db_storage/session/session.db', 'db_storage'];

      for (const indicator of v4Indicators) {
        const indicatorPath = path.join(dataPath, indicator);
        if (fs.existsSync(indicatorPath)) {
          logger.info('Detected WeChat v4 based on file structure');
          return 4;
        }
      }

      // 检查是否存在v3版本的特征文件
      const v3Indicators = ['Message/msg_0.db', 'Message'];

      for (const indicator of v3Indicators) {
        const indicatorPath = path.join(dataPath, indicator);
        if (fs.existsSync(indicatorPath)) {
          logger.info('Detected WeChat v3 based on file structure');
          return 3;
        }
      }

      // 默认返回v3
      logger.warn('Could not detect WeChat version, defaulting to v3');
      return 3;
    } catch (error) {
      logger.warn('Error detecting WeChat version:', error);
      return 3;
    }
>>>>>>> fa608a516bdb2e31ac2a69cf37db16759a82f9eb
  }

  /**
   * 获取微信原始数据目录（用于key命令）
   */
  private getWeChatSourceDir(): string {
    const os = require('os');
    const homeDir = os.homedir();

    // macOS微信数据目录
    if (process.platform === 'darwin') {
      // ! 这个是成功的
      // return '/Users/pipilu/Library/Containers/com.tencent.xinWeChat/Data/Library/Application\ Support/com.tencent.xinWeChat/2.0b4.0.9/48db8a3406267b90444b51abe056016c';
      // ! 这里缺少一些信息，可以让augment code 读取项目源码来获取缺少的路径
      return path.join(
        homeDir,
        'Library',
        'Containers',
        'com.tencent.xinWeChat',
        'Data',
        'Library',
        'Application Support',
        'com.tencent.xinWeChat'
      );
    }

    // Windows微信数据目录
    if (process.platform === 'win32') {
      return path.join(homeDir, 'Documents', 'WeChat Files');
    }

    // 默认返回用户主目录
    logger.warn(
      `Unsupported platform: ${process.platform}, using home directory`
    );
    return homeDir;
  }

  async checkStatus(): Promise<ChatlogStatus> {
    try {
<<<<<<< HEAD
      // 检查服务是否运行，使用联系人API作为健康检查
      const response = await fetch(`${this.baseUrl}/api/v1/contact`, {
        method: 'GET',
        timeout: 3000,
      } as any);
      return response.ok ? 'running' : 'error';
=======
      // 使用 HTTP 客户端检查服务状态
      const isRunning = await this.httpClient.checkServiceStatus();
      return isRunning ? 'running' : 'not-running';
>>>>>>> fa608a516bdb2e31ac2a69cf37db16759a82f9eb
    } catch (error) {
      logger.debug('Chatlog service not running:', error);
      return 'not-running';
    }
  }

  /**
   * 安全地检查服务状态，不会抛出异常
   */
  async checkStatusSafely(): Promise<ChatlogStatus> {
    try {
      return await this.checkStatus();
    } catch (error) {
      logger.debug('Safe status check failed:', error);
      return 'not-running';
    }
  }

  async startService(): Promise<boolean> {
    if (!this.isInitialized) {
      logger.error('ChatlogService not initialized');
      return false;
    }

    if (this.chatlogProcess) {
      logger.info('Chatlog service already running');
      return true;
    }

    try {
      logger.info(`Starting chatlog server by ${this.chatlogPath}`);

      // 获取解密后的数据目录
      const dataDir = this.getChatlogDataDir();
      logger.info(`Using chatlog data directory: ${dataDir}`);

      // 启动chatlog server命令，需要指定work-dir参数
      this.chatlogProcess = spawn(
        this.chatlogPath,
        ['server', '--work-dir', dataDir, '--addr', '127.0.0.1:5030'],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          detached: false,
        }
      );

      // 监听进程输出
      this.chatlogProcess.stdout?.on('data', data => {
        logger.debug(`Chatlog stdout: ${data.toString().trim()}`);
      });

      this.chatlogProcess.stderr?.on('data', data => {
        logger.warn(`Chatlog stderr: ${data.toString().trim()}`);
      });

      this.chatlogProcess.on('close', code => {
        logger.info(`Chatlog process exited with code ${code}`);
        this.chatlogProcess = null;
      });

      this.chatlogProcess.on('error', error => {
        logger.error('Chatlog process error:', error);
        this.chatlogProcess = null;
      });

      // 等待服务启动
      await this.waitForService();

      logger.info('Chatlog server started successfully');
      return true;
    } catch (error) {
      logger.error('Failed to start chatlog service:', error);
      this.chatlogProcess = null;
      return false;
    }
  }

  async stopService(): Promise<void> {
    if (this.chatlogProcess) {
      logger.info('Stopping chatlog service...');
      this.chatlogProcess.kill('SIGTERM');
      this.chatlogProcess = null;
    }
  }

  private async waitForService(
    maxAttempts = 10,
    interval = 1000
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus();
      if (status === 'running') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Chatlog service failed to start within timeout');
  }

  /**
   * 获取微信数据密钥
   */
  async getWechatKey(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return { success: false, message: 'ChatlogService not initialized' };
    }

    return new Promise(resolve => {
      logger.info('Getting WeChat key...');

      const process = spawn(this.chatlogPath, ['key'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', data => {
        output += data.toString();
      });

      process.stderr?.on('data', data => {
        errorOutput += data.toString();
      });

      process.on('close', code => {
        logger.info(`Get key process exited with code ${code}`);
        if (code === 0) {
          logger.info(`WeChat key obtained successfully: ${output.trim()}`);
          // 存储获取到的密钥
          this.wechatKey = output.trim();
          this.store.set('wechatKey', this.wechatKey);
          resolve({ success: true, message: output.trim() });
        } else {
          logger.error('Failed to get WeChat key:', errorOutput);
          resolve({
            success: false,
            message: errorOutput.trim() || 'Unknown error',
          });
        }
      });

      process.on('error', error => {
        logger.error('Error getting WeChat key:', error);
        resolve({ success: false, message: error.message });
      });
    });
  }

  /**
   * 解密数据库文件
   */
  async decryptDatabase(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return { success: false, message: 'ChatlogService not initialized' };
    }

    if (!this.wechatKey) {
      return {
        success: false,
        message: 'WeChat key not obtained. Please get key first.',
      };
    }

    return new Promise(resolve => {
      logger.info('Decrypting database...');

      // 获取微信原始数据目录和解密后的数据目录
      const wechatSourceDir = this.getWeChatSourceDir();
      const workDir = this.getChatlogDataDir();
      logger.info(
        `Using WeChat source directory (data-dir): ${wechatSourceDir}`
      );
      logger.info(`Decrypting to work directory (work-dir): ${workDir}`);
      logger.info(`Using key: ${this.wechatKey.substring(0, 10)}...`); // 只显示前10个字符

      const process = spawn(
        this.chatlogPath,
        [
          'decrypt',
          '--data-dir',
          wechatSourceDir, // 微信原始数据目录
          '--work-dir',
          workDir, // 解密后数据存放目录
          '--key',
          this.wechatKey,
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', data => {
        output += data.toString();
      });

      process.stderr?.on('data', data => {
        errorOutput += data.toString();
      });

      process.on('close', code => {
        if (code === 0) {
          logger.info('Database decrypted successfully');
          resolve({ success: true, message: output.trim() });
        } else {
          logger.error('Failed to decrypt database:', errorOutput);
          resolve({
            success: false,
            message: errorOutput.trim() || 'Unknown error',
          });
        }
      });

      process.on('error', error => {
        logger.error('Error decrypting database:', error);
        resolve({ success: false, message: error.message });
      });
    });
  }

  /**
   * 检查chatlog是否已经初始化（密钥获取和数据库解密）
   */
  async checkInitialization(): Promise<{
    keyObtained: boolean;
    databaseDecrypted: boolean;
    canStartServer: boolean;
  }> {
    // 这里可以通过检查特定文件或目录来判断初始化状态
    // 具体实现需要根据chatlog的实际行为来调整
    try {
<<<<<<< HEAD
      const status = await this.checkStatus();
      const canStartServer = status === 'running';
=======
      // 检查是否有密钥
      const keyObtained = !!this.wechatKey;

      // 检查是否有解密后的数据
      const workDir = this.getChatlogWorkDir();
      const databaseDecrypted = await this.checkDecryptedData(workDir);

      // 只有在有解密数据的情况下才检查服务状态
      let canStartServer = false;
      if (databaseDecrypted) {
        const status = await this.checkStatus();
        canStartServer = status === 'running';
      }
>>>>>>> fa608a516bdb2e31ac2a69cf37db16759a82f9eb

      return {
        keyObtained: true, // 简化实现，实际应该检查密钥文件
        databaseDecrypted: true, // 简化实现，实际应该检查解密后的数据库
        canStartServer,
      };
    } catch (error) {
      return {
        keyObtained: !!this.wechatKey,
        databaseDecrypted: false,
        canStartServer: false,
      };
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      return await this.httpClient.getContacts();
    } catch (error) {
      logger.error('Failed to get contacts:', error);
      return [];
    }
  }

  async getMessages(params: {
    startDate: string;
    endDate: string;
    talker?: string;
  }): Promise<ChatMessage[]> {
    try {
      return await this.httpClient.getMessages(params);
    } catch (error) {
      logger.error('Failed to get messages:', error);
      return [];
    }
  }

  /**
   * 获取群聊信息
   */
  async getChatroomInfo(chatroomId: string) {
    try {
      return await this.httpClient.getChatroomInfo(chatroomId);
    } catch (error) {
      logger.error(`Failed to get chatroom info for ${chatroomId}:`, error);
      return null;
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions() {
    try {
      return await this.httpClient.getSessions();
    } catch (error) {
      logger.error('Failed to get sessions:', error);
      return [];
    }
  }

  /**
   * 更新 Chatlog 服务地址
   */
  updateServiceUrl(newUrl: string) {
    this.baseUrl = newUrl;
    this.httpClient.updateBaseUrl(newUrl);
    logger.info(`Chatlog service URL updated to: ${newUrl}`);
  }

  async cleanup() {
    await this.stopService();
    logger.info('ChatlogService cleaned up');
  }
}
