import { createLogger } from '../utils/logger';
import type { ChatMessage, Contact, ChatlogStatus } from '@echosoul/common';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

const logger = createLogger('ChatlogService');

export class ChatlogService {
  private baseUrl = 'http://127.0.0.1:5030'; // chatlog默认端口
  private chatlogProcess: ChildProcess | null = null;
  private chatlogPath: string;
  private isInitialized = false;

  // TODO: wechatKey 是固定不变的，应该长期存储
  private wechatKey: string = ''; // 存储获取到的微信密钥

  constructor() {
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
   * 我们将数据解密到固定的目录：~/Documents/EchoSoul/chatlog_data
   */
  private getChatlogDataDir(): string {
    const os = require('os');
    const homeDir = os.homedir();

    // TODO: 需要更新为可选的目录
    // 使用固定的解密数据目录
    const dataDir = path.join(homeDir, 'Documents', 'EchoSoul', 'chatlog_data');

    // 确保目录存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Created chatlog data directory: ${dataDir}`);
    }

    return dataDir;
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
      // 检查服务是否运行，使用联系人API作为健康检查
      const response = await fetch(`${this.baseUrl}/api/v1/contact`, {
        method: 'GET',
        timeout: 3000,
      } as any);
      return response.ok ? 'running' : 'error';
    } catch (error) {
      logger.debug('Chatlog service not running:', error);
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
      const status = await this.checkStatus();
      const canStartServer = status === 'running';

      return {
        keyObtained: true, // 简化实现，实际应该检查密钥文件
        databaseDecrypted: true, // 简化实现，实际应该检查解密后的数据库
        canStartServer,
      };
    } catch (error) {
      return {
        keyObtained: false,
        databaseDecrypted: false,
        canStartServer: false,
      };
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contact`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeContacts(data);
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
      const url = new URL(`${this.baseUrl}/api/v1/chatlog`);
      url.searchParams.set('time', `${params.startDate}~${params.endDate}`);
      if (params.talker) {
        url.searchParams.set('talker', params.talker);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeMessages(data);
    } catch (error) {
      logger.error('Failed to get messages:', error);
      return [];
    }
  }

  private normalizeContacts(data: any[]): Contact[] {
    return data.map(item => ({
      id: item.id || item.wxid,
      name: item.name || item.nickname,
      type: item.type === 'chatroom' ? 'group' : 'individual',
      avatar: item.avatar,
      lastMessageTime: item.lastMessageTime,
    }));
  }

  private normalizeMessages(data: any[]): ChatMessage[] {
    return data.map(item => ({
      id: item.id || `${item.timestamp}-${item.sender}`,
      sender: item.sender || item.from,
      recipient: item.recipient || item.to,
      timestamp: item.timestamp,
      content: item.content || item.message,
      type: this.normalizeMessageType(item.type),
      isGroupChat: item.isGroupChat || false,
      groupName: item.groupName,
    }));
  }

  private normalizeMessageType(
    type: any
  ): 'text' | 'image' | 'voice' | 'video' | 'file' {
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'image':
        case 'img':
          return 'image';
        case 'voice':
        case 'audio':
          return 'voice';
        case 'video':
          return 'video';
        case 'file':
          return 'file';
        default:
          return 'text';
      }
    }
    return 'text';
  }

  async cleanup() {
    await this.stopService();
    logger.info('ChatlogService cleaned up');
  }
}
