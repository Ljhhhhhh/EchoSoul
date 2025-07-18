import { EventEmitter } from 'events'
import { createLogger } from '../../utils/logger'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'

const logger = createLogger('WeChatKeyService')

// 密钥获取结果
export interface KeyResult {
  success: boolean
  key?: string
  message?: string
  error?: string
}

// 密钥获取进度信息
export interface KeyProgress {
  step: string
  message: string
}

// 密钥服务接口
export interface IWeChatKeyService {
  getWeChatKey(chatlogPath: string): Promise<KeyResult>
  validateKey(key: string): boolean
}

export class WeChatKeyService extends EventEmitter implements IWeChatKeyService {
  private activeKeyProcess: ChildProcess | null = null

  /**
   * 获取微信数据密钥
   */
  async getWeChatKey(chatlogPath: string): Promise<KeyResult> {
    // 验证chatlog可执行文件
    if (!chatlogPath || !fs.existsSync(chatlogPath)) {
      return {
        success: false,
        error: `Chatlog executable not found: ${chatlogPath}`
      }
    }

    try {
      logger.info('Getting WeChat key...')
      this.emit('progress', {
        step: 'getting_key',
        message: 'Starting key extraction process...'
      } as KeyProgress)

      return await this.executeKeyExtraction(chatlogPath)
    } catch (error) {
      logger.error('Error in getWeChatKey:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 验证密钥格式
   */
  validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false
    }

    // 微信密钥通常是64位十六进制字符串
    const keyPattern = /^[a-fA-F0-9]{64}$/
    return keyPattern.test(key.trim())
  }

  /**
   * 取消当前密钥获取操作
   */
  cancelKeyExtraction(): void {
    if (this.activeKeyProcess) {
      logger.info('Cancelling key extraction process...')
      this.activeKeyProcess.kill('SIGTERM')
      this.activeKeyProcess = null
    }
  }

  /**
   * 执行密钥提取
   */
  private async executeKeyExtraction(chatlogPath: string): Promise<KeyResult> {
    return new Promise((resolve) => {
      this.activeKeyProcess = spawn(chatlogPath, ['key'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      this.activeKeyProcess.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text

        // 发射进度事件
        this.emit('progress', {
          step: 'extracting',
          message: 'Extracting encryption key from WeChat...'
        } as KeyProgress)
      })

      this.activeKeyProcess.stderr?.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        logger.debug(`Key extraction stderr: ${text.trim()}`)
      })

      this.activeKeyProcess.on('close', (code) => {
        this.activeKeyProcess = null

        logger.info(`Get key process exited with code ${code}`)

        if (code === 0) {
          const extractedKey = output.trim()

          // 验证提取的密钥
          if (this.validateKey(extractedKey)) {
            logger.info('WeChat key obtained and validated successfully')
            this.emit('progress', {
              step: 'completed',
              message: 'Key extraction completed successfully'
            } as KeyProgress)

            resolve({
              success: true,
              key: extractedKey,
              message: 'Key obtained successfully'
            })
          } else {
            logger.error('Invalid key format received')
            resolve({
              success: false,
              error: 'Invalid key format received'
            })
          }
        } else {
          logger.error('Failed to get WeChat key:', errorOutput)
          resolve({
            success: false,
            error: errorOutput.trim() || `Process exited with code ${code}`
          })
        }
      })

      this.activeKeyProcess.on('error', (error) => {
        this.activeKeyProcess = null
        logger.error('Error getting WeChat key:', error)
        resolve({
          success: false,
          error: `Failed to start key extraction process: ${error.message}`
        })
      })

      // 设置超时（30秒）
      const timeout = setTimeout(() => {
        if (this.activeKeyProcess) {
          logger.warn('Key extraction process timeout, killing process...')
          this.activeKeyProcess.kill('SIGTERM')
          resolve({
            success: false,
            error: 'Key extraction process timed out after 30 seconds'
          })
        }
      }, 30000)

      this.activeKeyProcess.on('close', () => {
        clearTimeout(timeout)
      })
    })
  }

  /**
   * 检查微信是否处于可提取密钥的状态
   */
  async checkWeChatKeyReadiness(): Promise<{ ready: boolean; message: string }> {
    try {
      // 这里可以添加检查微信进程状态、权限等逻辑
      // 目前简化实现
      return {
        ready: true,
        message: 'WeChat is ready for key extraction'
      }
    } catch (error) {
      logger.error('Error checking WeChat key readiness:', error)
      return {
        ready: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 获取密钥提取的前置条件检查
   */
  async getPrerequisites(): Promise<{
    wechatRunning: boolean
    hasPermissions: boolean
    chatlogAvailable: boolean
    message: string
  }> {
    try {
      // 检查微信是否运行
      // 这里应该使用WeChatDetectionService，但为了避免循环依赖，暂时简化
      const wechatRunning = true // 简化实现

      // 检查权限（在macOS上可能需要辅助功能权限）
      const hasPermissions = await this.checkPermissions()

      // 检查chatlog是否可用
      const chatlogAvailable = true // 在调用前已经验证

      const allReady = wechatRunning && hasPermissions && chatlogAvailable

      return {
        wechatRunning,
        hasPermissions,
        chatlogAvailable,
        message: allReady
          ? 'All prerequisites met for key extraction'
          : 'Some prerequisites are not met'
      }
    } catch (error) {
      logger.error('Error checking prerequisites:', error)
      return {
        wechatRunning: false,
        hasPermissions: false,
        chatlogAvailable: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 检查系统权限
   */
  private async checkPermissions(): Promise<boolean> {
    try {
      if (process.platform === 'darwin') {
        // 在macOS上，可能需要检查辅助功能权限
        // 这里简化实现，实际可以通过系统API检查
        return true
      } else if (process.platform === 'win32') {
        // 在Windows上，可能需要管理员权限
        return true
      }

      return true
    } catch (error) {
      logger.debug('Error checking permissions:', error)
      return false
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.cancelKeyExtraction()
    this.removeAllListeners()
    logger.debug('WeChatKeyService cleaned up')
  }
}

// 单例服务实例
let wechatKeyService: WeChatKeyService | null = null

export function getWeChatKeyService(): WeChatKeyService {
  if (!wechatKeyService) {
    wechatKeyService = new WeChatKeyService()
  }
  return wechatKeyService
}

// 便捷函数：直接获取密钥
export async function extractWeChatKey(chatlogPath: string): Promise<KeyResult> {
  const service = getWeChatKeyService()
  return await service.getWeChatKey(chatlogPath)
}

// 便捷函数：验证密钥
export function validateWeChatKey(key: string): boolean {
  const service = getWeChatKeyService()
  return service.validateKey(key)
}
