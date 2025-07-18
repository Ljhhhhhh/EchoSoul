import {
  WeChatDetector,
  WeChatDataInfo,
  WeChatProcessInfo,
  DetectionResult
} from './WeChatDetector'
import { execa } from 'execa'
import * as path from 'path'

// 微信版本常量
const WECHAT_CONSTANTS = {
  // macOS 数据库文件路径
  V3_DB_FILE_MAC: 'Message/msg_0.db',
  V4_DB_FILE_MAC: 'db_storage/session/session.db'
} as const

export class MacOSWeChatDetector extends WeChatDetector {
  /**
   * 检测微信进程
   */
  async detectWeChatProcesses(): Promise<DetectionResult<WeChatProcessInfo[]>> {
    try {
      const pids = await this.findWeChatProcesses()

      if (pids.length === 0) {
        return {
          success: true,
          data: []
        }
      }

      // 转换为 WeChatProcessInfo 格式
      const processInfos: WeChatProcessInfo[] = []
      for (const pid of pids) {
        // 获取进程名称
        const processName = await this.getProcessName(pid)
        if (processName) {
          // 通过分析打开的文件来确定版本
          const version = await this.determineWeChatVersionFromProcess(pid)

          processInfos.push({
            pid,
            name: processName,
            version: version || 3 // 默认为v3
          })
        }
      }

      this.logger.info(`Found ${processInfos.length} WeChat processes on macOS`)
      return {
        success: true,
        data: processInfos
      }
    } catch (error) {
      this.logger.error('Error detecting WeChat processes on macOS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 检测微信数据目录
   */
  async detectDataDirectory(): Promise<DetectionResult<WeChatDataInfo>> {
    try {
      const processResult = await this.detectWeChatProcesses()
      if (!processResult.success || !processResult.data || processResult.data.length === 0) {
        return {
          success: false,
          error: 'No WeChat process found'
        }
      }

      // 对每个微信进程，使用lsof获取打开的文件
      for (const processInfo of processResult.data) {
        const dataInfo = await this.getWeChatDataInfoFromProcess(processInfo.pid)
        if (dataInfo) {
          return {
            success: true,
            data: dataInfo
          }
        }
      }

      return {
        success: false,
        error: 'Failed to detect WeChat data directory'
      }
    } catch (error) {
      this.logger.error('Error detecting WeChat data directory on macOS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 检查微信是否运行
   */
  async isWeChatRunning(): Promise<boolean> {
    try {
      const pids = await this.findWeChatProcesses()
      return pids.length > 0
    } catch (error) {
      this.logger.debug('Error checking WeChat status on macOS:', error)
      return false
    }
  }

  /**
   * 查找macOS平台微信进程PID
   */
  private async findWeChatProcesses(): Promise<number[]> {
    try {
      const { stdout } = await execa('pgrep', ['-f', 'WeChat|Weixin'])
      const pids = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((pid) => parseInt(pid.trim()))
        .filter((pid) => !isNaN(pid))

      this.logger.debug(`Found WeChat PIDs: ${pids.join(', ')}`)
      return pids
    } catch (error) {
      // pgrep没找到进程时会返回错误，这是正常的
      this.logger.debug('No WeChat processes found via pgrep')
      return []
    }
  }

  /**
   * 获取进程名称
   */
  private async getProcessName(pid: number): Promise<string | null> {
    try {
      const { stdout } = await execa('ps', ['-p', pid.toString(), '-o', 'comm='])
      return stdout.trim()
    } catch (error) {
      this.logger.debug(`Failed to get process name for PID ${pid}:`, error)
      return null
    }
  }

  /**
   * 通过分析进程打开的文件来确定微信版本
   */
  private async determineWeChatVersionFromProcess(pid: number): Promise<number | null> {
    try {
      const { stdout } = await execa('lsof', ['-p', pid.toString(), '-F', 'n'])

      const files = stdout
        .split('\n')
        .filter((line) => line.startsWith('n'))
        .map((line) => line.substring(1)) // 移除前缀'n'

      // 检查是否包含v4版本的特征文件
      for (const filePath of files) {
        if (filePath.includes(WECHAT_CONSTANTS.V4_DB_FILE_MAC)) {
          this.logger.debug(`Detected WeChat v4 from file: ${filePath}`)
          return 4
        }
      }

      // 检查是否包含v3版本的特征文件
      for (const filePath of files) {
        if (filePath.includes(WECHAT_CONSTANTS.V3_DB_FILE_MAC)) {
          this.logger.debug(`Detected WeChat v3 from file: ${filePath}`)
          return 3
        }
      }

      // 默认返回v3
      this.logger.debug(`Could not determine WeChat version for PID ${pid}, defaulting to v3`)
      return 3
    } catch (error) {
      this.logger.debug(`Error determining WeChat version for PID ${pid}:`, error)
      return null
    }
  }

  /**
   * 从macOS微信进程获取数据信息
   */
  private async getWeChatDataInfoFromProcess(pid: number): Promise<WeChatDataInfo | null> {
    try {
      const { stdout } = await execa('lsof', ['-p', pid.toString(), '-F', 'n'])

      const files = stdout
        .split('\n')
        .filter((line) => line.startsWith('n'))
        .map((line) => line.substring(1)) // 移除前缀'n'

      // 查找包含msg_0.db或session.db的路径
      for (const filePath of files) {
        if (
          filePath.includes(WECHAT_CONSTANTS.V3_DB_FILE_MAC) ||
          filePath.includes(WECHAT_CONSTANTS.V4_DB_FILE_MAC)
        ) {
          // 提取数据目录路径
          const pathParts = filePath.split(path.sep)

          if (filePath.includes(WECHAT_CONSTANTS.V3_DB_FILE_MAC)) {
            // v3版本: .../2.0b4.0.9/{用户ID}/Message/msg_0.db
            const dataDir = pathParts.slice(0, -2).join(path.sep)
            const accountName = pathParts[pathParts.length - 3] || 'unknown'

            this.logger.info(`Detected WeChat v3 data directory: ${dataDir}`)
            return {
              dataDir,
              accountName,
              version: 3,
              status: 'online'
            }
          } else if (filePath.includes(WECHAT_CONSTANTS.V4_DB_FILE_MAC)) {
            // v4版本: .../{用户ID}/db_storage/session/session.db
            const dataDir = pathParts.slice(0, -3).join(path.sep)
            const accountName = pathParts[pathParts.length - 4] || 'unknown'

            this.logger.info(`Detected WeChat v4 data directory: ${dataDir}`)
            return {
              dataDir,
              accountName,
              version: 4,
              status: 'online'
            }
          }
        }
      }

      this.logger.debug(`No WeChat data directory found for PID ${pid}`)
      return null
    } catch (error) {
      this.logger.debug(`Error getting WeChat data info from process ${pid}:`, error)
      return null
    }
  }

  /**
   * 检测微信版本（基于文件系统结构）
   */
  async detectWeChatVersionFromPath(dataPath: string): Promise<number> {
    try {
      const fs = await import('fs')

      // 检查是否存在v4版本的特征文件
      const v4Indicators = ['db_storage/session/session.db', 'db_storage']

      for (const indicator of v4Indicators) {
        const indicatorPath = path.join(dataPath, indicator)
        if (fs.existsSync(indicatorPath)) {
          this.logger.info('Detected WeChat v4 based on file structure')
          return 4
        }
      }

      // 检查是否存在v3版本的特征文件
      const v3Indicators = ['Message/msg_0.db', 'Message']

      for (const indicator of v3Indicators) {
        const indicatorPath = path.join(dataPath, indicator)
        if (fs.existsSync(indicatorPath)) {
          this.logger.info('Detected WeChat v3 based on file structure')
          return 3
        }
      }

      // 默认返回v3
      this.logger.warn('Could not detect WeChat version from path, defaulting to v3')
      return 3
    } catch (error) {
      this.logger.warn('Error detecting WeChat version from path:', error)
      return 3
    }
  }

  /**
   * 获取所有可能的微信数据目录（用于离线检测）
   */
  async getAllPossibleDataDirectories(): Promise<string[]> {
    try {
      const os = await import('os')
      const fs = await import('fs')

      const homeDir = os.homedir()
      const possiblePaths = [
        path.join(
          homeDir,
          'Library/Containers/com.tencent.xinWeChat/Data/Library/Application Support/com.tencent.xinWeChat'
        ),
        path.join(homeDir, 'Library/Application Support/WeChat'),
        path.join(homeDir, 'Documents/WeChat Files')
      ]

      const existingPaths: string[] = []
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          existingPaths.push(possiblePath)
        }
      }

      this.logger.debug(`Found ${existingPaths.length} possible WeChat data directories`)
      return existingPaths
    } catch (error) {
      this.logger.error('Error getting possible data directories:', error)
      return []
    }
  }

  /**
   * 扫描目录寻找微信账户数据
   */
  async scanForWeChatAccounts(basePath: string): Promise<WeChatDataInfo[]> {
    try {
      const fs = await import('fs')
      const accounts: WeChatDataInfo[] = []

      if (!fs.existsSync(basePath)) {
        return accounts
      }

      const entries = fs.readdirSync(basePath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const accountPath = path.join(basePath, entry.name)
          const version = await this.detectWeChatVersionFromPath(accountPath)

          // 验证是否为有效的微信账户目录
          const isValidAccount = await this.validateWeChatAccountDirectory(accountPath, version)

          if (isValidAccount) {
            accounts.push({
              dataDir: accountPath,
              accountName: entry.name,
              version,
              status: 'offline' // 文件系统扫描，状态为离线
            })
          }
        }
      }

      this.logger.info(`Found ${accounts.length} WeChat accounts in ${basePath}`)
      return accounts
    } catch (error) {
      this.logger.error(`Error scanning for WeChat accounts in ${basePath}:`, error)
      return []
    }
  }

  /**
   * 验证是否为有效的微信账户目录
   */
  private async validateWeChatAccountDirectory(
    accountPath: string,
    version: number
  ): Promise<boolean> {
    try {
      const fs = await import('fs')

      if (version === 4) {
        // v4版本需要有db_storage目录
        const dbStoragePath = path.join(accountPath, 'db_storage')
        return fs.existsSync(dbStoragePath)
      } else {
        // v3版本需要有Message目录
        const messagePath = path.join(accountPath, 'Message')
        return fs.existsSync(messagePath)
      }
    } catch (error) {
      this.logger.debug(`Error validating account directory ${accountPath}:`, error)
      return false
    }
  }
}
