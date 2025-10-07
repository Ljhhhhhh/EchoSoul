import { EventEmitter } from 'events'
import { createLogger } from '../../utils/logger'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'

const logger = createLogger('ProcessService')

// 进程状态
export enum ProcessStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error'
}

// 进程配置
export interface ProcessConfig {
  executable: string
  args: string[]
  workDir?: string
  env?: Record<string, string>
  timeout?: number
}

// 进程结果
export interface ProcessResult<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 进程管理服务
export class ProcessService extends EventEmitter {
  private process: ChildProcess | null = null
  private status: ProcessStatus = ProcessStatus.STOPPED
  private config: ProcessConfig | null = null
  private startTime: number = 0
  private restartAttempts = 0
  private readonly maxRestartAttempts = 3

  /**
   * 启动进程
   */
  async startProcess(config: ProcessConfig): Promise<ProcessResult> {
    if (this.status === ProcessStatus.RUNNING) {
      return {
        success: true,
        message: 'Process is already running'
      }
    }

    if (this.status === ProcessStatus.STARTING) {
      return {
        success: false,
        error: 'Process is already starting'
      }
    }

    // 验证配置
    const validation = this.validateConfig(config)
    if (!validation.success) {
      return validation
    }

    this.config = config
    this.setStatus(ProcessStatus.STARTING)

    try {
      logger.info(`Starting process: ${config.executable}`)
      logger.info(`Arguments: ${config.args.join(' ')}`)

      this.process = spawn(config.executable, config.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        cwd: config.workDir,
        env: { ...process.env, ...config.env }
      })

      this.setupProcessHandlers()

      // 等待进程启动
      const result = await this.waitForStartup(config.timeout || 30000)

      if (result.success) {
        this.startTime = Date.now()
        this.restartAttempts = 0
        this.setStatus(ProcessStatus.RUNNING)
        logger.info('Process started successfully')
      } else {
        this.setStatus(ProcessStatus.ERROR)
      }

      return result
    } catch (error) {
      this.setStatus(ProcessStatus.ERROR)
      logger.error('Failed to start process:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 停止进程
   */
  async stopProcess(force = false): Promise<ProcessResult> {
    if (this.status === ProcessStatus.STOPPED) {
      return {
        success: true,
        message: 'Process is already stopped'
      }
    }

    if (!this.process) {
      this.setStatus(ProcessStatus.STOPPED)
      return {
        success: true,
        message: 'No process to stop'
      }
    }

    this.setStatus(ProcessStatus.STOPPING)
    logger.info('Stopping process...')

    try {
      if (force) {
        this.process.kill('SIGKILL')
      } else {
        this.process.kill('SIGTERM')

        // 等待优雅关闭，如果超时则强制关闭
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            logger.warn('Process did not stop gracefully, forcing shutdown')
            this.process.kill('SIGKILL')
          }
        }, 5000)
      }

      return {
        success: true,
        message: 'Process stop signal sent'
      }
    } catch (error) {
      logger.error('Error stopping process:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 重启进程
   */
  async restartProcess(): Promise<ProcessResult> {
    logger.info('Restarting process...')

    if (this.status === ProcessStatus.RUNNING) {
      const stopResult = await this.stopProcess()
      if (!stopResult.success) {
        return stopResult
      }

      // 等待进程完全停止
      await this.waitForStatus(ProcessStatus.STOPPED, 10000)
    }

    if (!this.config) {
      return {
        success: false,
        error: 'No configuration available for restart'
      }
    }

    return await this.startProcess(this.config)
  }

  /**
   * 获取进程状态
   */
  getStatus(): ProcessStatus {
    return this.status
  }

  /**
   * 获取进程信息
   */
  getProcessInfo() {
    return {
      status: this.status,
      pid: this.process?.pid,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      restartAttempts: this.restartAttempts,
      config: this.config
    }
  }

  /**
   * 检查进程是否健康运行
   */
  async healthCheck(): Promise<boolean> {
    if (this.status !== ProcessStatus.RUNNING || !this.process) {
      return false
    }

    try {
      // 检查进程是否还存在
      const isAlive = !this.process.killed && this.process.pid !== undefined

      if (!isAlive) {
        this.setStatus(ProcessStatus.ERROR)
        return false
      }

      return true
    } catch (error) {
      logger.error('Health check failed:', error)
      return false
    }
  }

  /**
   * 启用自动重启
   */
  enableAutoRestart(enabled = true): void {
    if (enabled) {
      this.on('processExit', this.handleAutoRestart.bind(this))
    } else {
      this.removeListener('processExit', this.handleAutoRestart.bind(this))
    }
  }

  /**
   * 验证配置
   */
  private validateConfig(config: ProcessConfig): ProcessResult {
    if (!config.executable) {
      return {
        success: false,
        error: 'Executable path is required'
      }
    }

    if (!fs.existsSync(config.executable)) {
      return {
        success: false,
        error: `Executable not found: ${config.executable}`
      }
    }

    if (config.workDir && !fs.existsSync(config.workDir)) {
      return {
        success: false,
        error: `Work directory not found: ${config.workDir}`
      }
    }

    return { success: true }
  }

  /**
   * 设置进程处理器
   */
  private setupProcessHandlers(): void {
    if (!this.process) return

    this.process.stdout?.on('data', (data) => {
      const output = data.toString().trim()
      logger.debug(`Process stdout: ${output}`)
      this.emit('stdout', output)
    })

    this.process.stderr?.on('data', (data) => {
      const output = data.toString().trim()
      logger.warn(`Process stderr: ${output}`)
      this.emit('stderr', output)
    })

    this.process.on('close', (code, signal) => {
      logger.info(`Process exited with code ${code}, signal ${signal}`)
      this.process = null
      this.setStatus(ProcessStatus.STOPPED)
      this.emit('processExit', { code, signal })
    })

    this.process.on('error', (error) => {
      logger.error('Process error:', error)
      this.process = null
      this.setStatus(ProcessStatus.ERROR)
      this.emit('processError', error)
    })
  }

  /**
   * 等待进程启动
   */
  private async waitForStartup(timeout: number): Promise<ProcessResult> {
    return new Promise((resolve) => {
      const startTime = Date.now()

      const checkStartup = () => {
        if (this.status === ProcessStatus.ERROR) {
          resolve({
            success: false,
            error: 'Process failed to start'
          })
          return
        }

        if (Date.now() - startTime > timeout) {
          resolve({
            success: false,
            error: 'Process startup timeout'
          })
          return
        }

        // 这里可以添加特定的启动检查逻辑
        // 例如检查端口是否开放、日志是否包含特定内容等
        if (this.process && !this.process.killed) {
          resolve({
            success: true,
            message: 'Process started successfully'
          })
          return
        }

        setTimeout(checkStartup, 1000)
      }

      checkStartup()
    })
  }

  /**
   * 等待特定状态
   */
  private async waitForStatus(targetStatus: ProcessStatus, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.status === targetStatus) {
        resolve(true)
        return
      }

      const startTime = Date.now()

      const checkStatus = () => {
        if (this.status === targetStatus) {
          resolve(true)
          return
        }

        if (Date.now() - startTime > timeout) {
          resolve(false)
          return
        }

        setTimeout(checkStatus, 100)
      }

      checkStatus()
    })
  }

  /**
   * 设置状态并发射事件
   */
  private setStatus(status: ProcessStatus): void {
    if (this.status !== status) {
      const oldStatus = this.status
      this.status = status
      logger.debug(`Process status changed: ${oldStatus} -> ${status}`)
      this.emit('statusChanged', { oldStatus, newStatus: status })
    }
  }

  /**
   * 处理自动重启
   */
  private async handleAutoRestart(): Promise<void> {
    if (this.restartAttempts >= this.maxRestartAttempts) {
      logger.error(`Max restart attempts (${this.maxRestartAttempts}) reached, giving up`)
      this.emit('maxRestartsReached')
      return
    }

    this.restartAttempts++
    logger.info(
      `Auto-restarting process (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`
    )

    // 等待一段时间再重启
    setTimeout(async () => {
      const result = await this.restartProcess()
      if (!result.success) {
        logger.error('Auto-restart failed:', result.error)
      }
    }, 2000)
  }
}
