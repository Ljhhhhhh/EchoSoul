import { EventEmitter } from 'events'
import { createLogger } from '../../utils/logger'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const logger = createLogger('WeChatDatabaseService')

// 数据库操作结果
export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 解密进度信息
export interface DecryptionProgress {
  step: string
  progress: number
  message: string
}

// 微信数据库服务接口
export interface IWeChatDatabaseService {
  decryptDatabase(params: DecryptionParams): Promise<DatabaseResult>
  checkDecryptedData(workDir: string): Promise<boolean>
  validateDatabaseIntegrity(workDir: string): Promise<DatabaseResult<boolean>>
}

// 解密参数
export interface DecryptionParams {
  sourceDir: string
  workDir: string
  key: string
  chatlogPath: string
}

export class WeChatDatabaseService extends EventEmitter implements IWeChatDatabaseService {
  private activeDecryptionProcess: ChildProcess | null = null

  /**
   * 解密微信数据库
   */
  async decryptDatabase(params: DecryptionParams): Promise<DatabaseResult> {
    const { sourceDir, workDir, key } = params

    // 验证参数
    const validation = this.validateDecryptionParams(params)
    if (!validation.success) {
      return validation
    }

    try {
      logger.info('Starting WeChat database decryption...')
      logger.info(`Source directory: ${sourceDir}`)
      logger.info(`Target directory: ${workDir}`)
      logger.info(`Key: ${key.substring(0, 10)}...`)

      return await this.executeDecryption(params)
    } catch (error) {
      logger.error('Error in decryptDatabase:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 检查解密后的数据是否存在
   */
  async checkDecryptedData(workDir: string): Promise<boolean> {
    try {
      if (!fs.existsSync(workDir)) {
        return false
      }

      const dbFiles = this.findDatabaseFiles(workDir)
      return dbFiles.length > 0
    } catch (error) {
      logger.debug('Error checking decrypted data:', error)
      return false
    }
  }

  /**
   * 验证微信数据库完整性
   */
  async validateDatabaseIntegrity(workDir: string): Promise<DatabaseResult<boolean>> {
    try {
      const dbFiles = this.findDatabaseFiles(workDir)

      if (dbFiles.length === 0) {
        return {
          success: false,
          error: 'No database files found'
        }
      }

      // 检查关键数据库文件
      const requiredFiles = ['session.db', 'msg_0.db', 'contact.db']
      const foundFiles = dbFiles.map((f) => path.basename(f))
      const hasRequiredFiles = requiredFiles.some((required) =>
        foundFiles.some((found) => found.includes(required.split('.')[0]))
      )

      if (!hasRequiredFiles) {
        return {
          success: false,
          error: 'Required database files not found'
        }
      }

      // 检查文件大小（基本完整性检查）
      for (const dbFile of dbFiles) {
        const stats = fs.statSync(dbFile)
        if (stats.size === 0) {
          return {
            success: false,
            error: `Database file is empty: ${dbFile}`
          }
        }
      }

      return {
        success: true,
        data: true,
        message: `Found ${dbFiles.length} valid database files`
      }
    } catch (error) {
      logger.error('Error validating database integrity:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 取消当前解密操作
   */
  cancelDecryption(): void {
    if (this.activeDecryptionProcess) {
      logger.info('Cancelling decryption process...')
      this.activeDecryptionProcess.kill('SIGTERM')
      this.activeDecryptionProcess = null
    }
  }

  /**
   * 验证解密参数
   */
  private validateDecryptionParams(params: DecryptionParams): DatabaseResult {
    const { sourceDir, workDir, key, chatlogPath } = params

    if (!sourceDir || !fs.existsSync(sourceDir)) {
      return {
        success: false,
        error: `Source directory not found: ${sourceDir}`
      }
    }

    if (!key || key.length === 0) {
      return {
        success: false,
        error: 'Decryption key is required'
      }
    }

    if (!chatlogPath || !fs.existsSync(chatlogPath)) {
      return {
        success: false,
        error: `Chatlog executable not found: ${chatlogPath}`
      }
    }

    // 确保工作目录存在
    if (!fs.existsSync(workDir)) {
      try {
        fs.mkdirSync(workDir, { recursive: true })
      } catch (error) {
        return {
          success: false,
          error: `Failed to create work directory: ${workDir}`
        }
      }
    }

    return { success: true }
  }

  /**
   * 执行解密操作
   */
  private async executeDecryption(params: DecryptionParams): Promise<DatabaseResult> {
    const { sourceDir, workDir, key, chatlogPath } = params

    return new Promise((resolve) => {
      this.activeDecryptionProcess = spawn(
        chatlogPath,
        ['decrypt', '--data-dir', sourceDir, '--work-dir', workDir, '--key', key],
        {
          stdio: ['pipe', 'pipe', 'pipe']
        }
      )

      let output = ''
      let errorOutput = ''

      this.activeDecryptionProcess.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text

        // 解析进度信息并发射事件
        this.parseAndEmitProgress(text)
      })

      this.activeDecryptionProcess.stderr?.on('data', (data) => {
        const text = data.toString().trim()
        errorOutput += text

        // 忽略某些预期的警告信息
        if (text !== 'incorrect decryption key') {
          logger.warn(`Decrypt stderr: ${text}`)
        }
      })

      this.activeDecryptionProcess.on('close', (code) => {
        this.activeDecryptionProcess = null

        if (code === 0) {
          logger.info('WeChat database decryption completed successfully')
          resolve({
            success: true,
            message: 'Database decryption completed successfully'
          })
        } else {
          logger.error('WeChat database decryption failed with code:', code)
          resolve({
            success: false,
            error: errorOutput || `Process exited with code ${code}`
          })
        }
      })

      this.activeDecryptionProcess.on('error', (error) => {
        this.activeDecryptionProcess = null
        logger.error('Error starting decrypt process:', error)
        resolve({
          success: false,
          error: `Failed to start decryption process: ${error.message}`
        })
      })

      // 设置超时（5分钟）
      const timeout = setTimeout(
        () => {
          if (this.activeDecryptionProcess) {
            logger.warn('Decryption process timeout, killing process...')
            this.activeDecryptionProcess.kill('SIGTERM')
            resolve({
              success: false,
              error: 'Decryption process timed out after 5 minutes'
            })
          }
        },
        5 * 60 * 1000
      )

      this.activeDecryptionProcess.on('close', () => {
        clearTimeout(timeout)
      })
    })
  }

  /**
   * 解析进度信息并发射事件
   */
  private parseAndEmitProgress(output: string): void {
    // 这里可以根据chatlog的输出格式解析进度
    // 示例实现
    const lines = output.split('\n')
    for (const line of lines) {
      if (line.includes('Processing') || line.includes('Decrypting')) {
        this.emit('progress', {
          step: 'decrypting',
          progress: 50, // 可以根据实际输出计算进度
          message: line.trim()
        } as DecryptionProgress)
      }
    }
  }

  /**
   * 递归查找数据库文件
   */
  private findDatabaseFiles(dir: string): string[] {
    const files: string[] = []

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          files.push(...this.findDatabaseFiles(fullPath))
        } else if (entry.name.endsWith('.db')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      logger.debug(`Error reading directory ${dir}:`, error)
    }

    return files
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.cancelDecryption()
    this.removeAllListeners()
    logger.debug('WeChatDatabaseService cleaned up')
  }
}

// 单例服务实例
let wechatDatabaseService: WeChatDatabaseService | null = null

export function getWeChatDatabaseService(): WeChatDatabaseService {
  if (!wechatDatabaseService) {
    wechatDatabaseService = new WeChatDatabaseService()
  }
  return wechatDatabaseService
}

// 便捷函数：直接解密数据库
export async function decryptWeChatDatabase(params: DecryptionParams): Promise<DatabaseResult> {
  const service = getWeChatDatabaseService()
  return await service.decryptDatabase(params)
}
