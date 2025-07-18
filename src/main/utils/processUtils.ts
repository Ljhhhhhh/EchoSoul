import { execa } from 'execa'
import { createLogger } from './logger'

const logger = createLogger('ProcessUtils')

/**
 * 跨平台进程检测工具
 */
export class ProcessUtils {
  /**
   * 查找微信进程（跨平台实现）
   * @returns 微信进程的PID数组
   */
  static async findWeChatProcesses(): Promise<number[]> {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        return await this.findWeChatProcessesWindows()
      } else {
        return await this.findWeChatProcessesUnix()
      }
    } catch (error) {
      logger.debug('查找微信进程时出错:', error)
      // 命令没找到进程时会返回错误，这是正常的
      return []
    }
  }

  /**
   * Windows 平台查找微信进程
   */
  private static async findWeChatProcessesWindows(): Promise<number[]> {
    // Windows 微信进程名，支持多个版本
    const processNames = ['WeChat.exe', 'Weixin.exe']
    const allPids: number[] = []

    for (const processName of processNames) {
      try {
        const { stdout } = await execa('tasklist', [
          '/FI',
          `IMAGENAME eq ${processName}`,
          '/FO',
          'CSV'
        ])

        const lines = stdout.trim().split('\n')

        // 跳过标题行，解析CSV格式的输出
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line) {
            // CSV格式: "Image Name","PID","Session Name","Session#","Mem Usage"
            const columns = line.split('","')
            if (columns.length >= 2) {
              const pidStr = columns[1].replace(/"/g, '')
              const pid = parseInt(pidStr)
              if (!isNaN(pid) && !allPids.includes(pid)) {
                allPids.push(pid)
                logger.debug(`Found WeChat process: ${processName} (PID: ${pid})`)
              }
            }
          }
        }
      } catch (error) {
        // 某个进程名没找到是正常的，继续查找其他进程名
        logger.debug(`Process ${processName} not found:`, error)
      }
    }

    return allPids
  }

  /**
   * Unix 平台（macOS/Linux）查找微信进程
   */
  private static async findWeChatProcessesUnix(): Promise<number[]> {
    const { stdout } = await execa('pgrep', ['-f', 'WeChat|Weixin'])
    const pids = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((pid) => parseInt(pid.trim()))
      .filter((pid) => !isNaN(pid))
    return pids
  }

  /**
   * 检查指定进程是否正在运行
   * @param processName 进程名称
   * @returns 是否正在运行
   */
  static async isProcessRunning(processName: string): Promise<boolean> {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        const { stdout } = await execa('tasklist', [
          '/FI',
          `IMAGENAME eq ${processName}`,
          '/FO',
          'CSV'
        ])
        const lines = stdout.trim().split('\n')
        return lines.length > 1 // 有标题行，所以大于1表示有进程
      } else {
        const { stdout } = await execa('pgrep', ['-f', processName])
        return stdout.trim().length > 0
      }
    } catch (error) {
      // 命令没找到进程时会返回错误，这是正常的
      return false
    }
  }

  /**
   * 获取指定进程的PID列表
   * @param processName 进程名称
   * @returns PID数组
   */
  static async getProcessPids(processName: string): Promise<number[]> {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        const { stdout } = await execa('tasklist', [
          '/FI',
          `IMAGENAME eq ${processName}`,
          '/FO',
          'CSV'
        ])
        const lines = stdout.trim().split('\n')
        const pids: number[] = []

        // 跳过标题行
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line) {
            const columns = line.split('","')
            if (columns.length >= 2) {
              const pidStr = columns[1].replace(/"/g, '')
              const pid = parseInt(pidStr)
              if (!isNaN(pid)) {
                pids.push(pid)
              }
            }
          }
        }

        return pids
      } else {
        const { stdout } = await execa('pgrep', ['-f', processName])
        const pids = stdout
          .trim()
          .split('\n')
          .filter((line) => line.trim())
          .map((pid) => parseInt(pid.trim()))
          .filter((pid) => !isNaN(pid))
        return pids
      }
    } catch (error) {
      // 命令没找到进程时会返回错误，这是正常的
      return []
    }
  }

  /**
   * 检查端口是否被占用（跨平台实现）
   * @param port 端口号
   * @returns 是否被占用
   */
  static async isPortInUse(port: number): Promise<boolean> {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        // Windows 使用 netstat 命令
        const { stdout } = await execa('netstat', ['-an'])
        const lines = stdout.split('\n')

        // 查找监听指定端口的行
        for (const line of lines) {
          if (line.includes(`127.0.0.1:${port}`) || line.includes(`:${port}`)) {
            if (line.includes('LISTENING') || line.includes('ESTABLISHED')) {
              return true
            }
          }
        }

        return false
      } else {
        // Unix 系统使用 lsof 命令
        const { stdout } = await execa('lsof', ['-i', `:${port}`])
        return stdout.trim().length > 0
      }
    } catch (error) {
      // 命令没找到端口使用时会返回错误，这是正常的
      return false
    }
  }
}
