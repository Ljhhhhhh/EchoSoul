import {
  WeChatDetector,
  WeChatDataInfo,
  WeChatProcessInfo,
  DetectionResult
} from './WeChatDetector'
import { execa } from 'execa'
import { getHandleExePath } from '../../utils/resourceManager'
import * as fs from 'fs'
import * as path from 'path'

// 微信版本常量
const WECHAT_CONSTANTS = {
  // Windows 进程名
  V3_PROCESS_NAMES: ['WeChat.exe'], // 支持多种V3进程名
  V4_PROCESS_NAME: 'Weixin.exe',
  // 数据库文件路径
  V3_DB_FILE: 'Msg\\Misc.db',
  V4_DB_FILE: 'db_storage\\session\\session.db'
} as const

interface WindowsProcess {
  pid: number
  name: string
}

export class WindowsWeChatDetector extends WeChatDetector {
  /**
   * 检测微信进程
   */
  async detectWeChatProcesses(): Promise<DetectionResult<WeChatProcessInfo[]>> {
    try {
      const processes = await this.getWindowsProcesses()

      // 筛选微信进程
      const wechatProcesses = processes.filter((proc) => {
        const name = proc.name.toLowerCase()
        const isV3Process = WECHAT_CONSTANTS.V3_PROCESS_NAMES.some(
          (v3Name) => name === v3Name.toLowerCase()
        )
        const isV4Process = name === WECHAT_CONSTANTS.V4_PROCESS_NAME.toLowerCase()
        return isV3Process || isV4Process
      })

      this.logger.info(`Found WeChat processes: ${JSON.stringify(wechatProcesses)}`)

      // 转换为 WeChatProcessInfo 格式
      const processInfos: WeChatProcessInfo[] = []
      for (const proc of wechatProcesses) {
        const version = this.determineWeChatVersion(proc.name)
        if (version > 0) {
          // 对于V4版本，需要排除子进程
          if (version === 4 && (await this.isV4Subprocess(proc.pid))) {
            this.logger.debug(`Skipping WeChat V4 subprocess with PID ${proc.pid}`)
            continue
          }

          processInfos.push({
            pid: proc.pid,
            name: proc.name,
            version
          })
        }
      }

      return {
        success: true,
        data: processInfos
      }
    } catch (error) {
      this.logger.error('Error detecting WeChat processes:', error)
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

      // 对每个微信进程，尝试检测数据目录
      for (const processInfo of processResult.data) {
        const dataInfo = await this.searchWeChatDataDirectory(processInfo.version)
        if (dataInfo) {
          dataInfo.status = 'online' // 进程在运行，状态为在线
          this.logger.info(`Found WeChat V${dataInfo.version} data directory: ${dataInfo.dataDir}`)
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
      this.logger.error('Error detecting WeChat data directory:', error)
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
      const result = await this.detectWeChatProcesses()
      return result.success && result.data !== undefined && result.data.length > 0
    } catch (error) {
      this.logger.debug('Error checking WeChat status:', error)
      return false
    }
  }

  /**
   * 使用 Windows 系统命令获取进程列表
   */
  private async getWindowsProcesses(): Promise<WindowsProcess[]> {
    try {
      // 使用 tasklist 命令获取进程列表
      const { stdout } = await execa('tasklist', ['/fo', 'csv', '/nh'])

      const processes: WindowsProcess[] = []
      const lines = stdout.split('\n')

      for (const line of lines) {
        if (line.trim()) {
          // CSV 格式: "进程名","PID","会话名","会话#","内存使用"
          const match = line.match(/"([^"]+)","(\d+)"/)
          if (match) {
            const name = match[1]
            const pid = parseInt(match[2])
            if (!isNaN(pid)) {
              processes.push({ pid, name })
            }
          }
        }
      }

      return processes
    } catch (error) {
      this.logger.error('Error getting Windows processes:', error)
      return []
    }
  }

  /**
   * 确定微信版本
   */
  private determineWeChatVersion(processName: string): number {
    const name = processName.toLowerCase()

    const isV3Process = WECHAT_CONSTANTS.V3_PROCESS_NAMES.some(
      (v3Name) => name === v3Name.toLowerCase()
    )
    const isV4Process = name === WECHAT_CONSTANTS.V4_PROCESS_NAME.toLowerCase()

    if (isV3Process) {
      return 3
    } else if (isV4Process) {
      return 4
    }

    return 0 // 未知版本
  }

  /**
   * 检查是否为V4子进程
   */
  private async isV4Subprocess(pid: number): Promise<boolean> {
    try {
      // 使用 wmic 获取进程命令行
      const { stdout } = await execa('wmic', [
        'process',
        'where',
        `ProcessId=${pid}`,
        'get',
        'CommandLine',
        '/format:value'
      ])

      return stdout.includes('--')
    } catch (error) {
      this.logger.debug(`Failed to get command line for PID ${pid}:`, error)
      return false
    }
  }

  /**
   * 搜索Windows平台微信数据目录
   */
  private async searchWeChatDataDirectory(version: number): Promise<WeChatDataInfo | null> {
    try {
      // 获取所有微信进程
      const processes = await this.getWindowsProcesses()
      const wechatProcesses = processes.filter((proc) => {
        const name = proc.name.toLowerCase()
        const isV3Process = WECHAT_CONSTANTS.V3_PROCESS_NAMES.some(
          (v3Name) => name === v3Name.toLowerCase()
        )
        const isV4Process = name === WECHAT_CONSTANTS.V4_PROCESS_NAME.toLowerCase()
        return isV3Process || isV4Process
      })

      if (wechatProcesses.length === 0) {
        this.logger.debug('No WeChat processes found for file handle analysis')
        return null
      }

      // 对每个微信进程，分析其打开的文件句柄
      for (const proc of wechatProcesses) {
        const dataInfo = await this.analyzeProcessFileHandles(proc.pid, version)
        if (dataInfo) {
          return dataInfo
        }
      }

      return null
    } catch (error) {
      this.logger.error('Error searching WeChat data directory on Windows:', error)
      return null
    }
  }

  /**
   * 分析进程打开的文件句柄，寻找微信数据库文件
   */
  private async analyzeProcessFileHandles(
    pid: number,
    version: number
  ): Promise<WeChatDataInfo | null> {
    try {
      // 使用多种方法获取进程打开的文件
      const openFiles = await this.getProcessOpenFiles(pid)

      // 根据版本确定目标数据库文件
      const targetDbFile = version === 4 ? WECHAT_CONSTANTS.V4_DB_FILE : WECHAT_CONSTANTS.V3_DB_FILE

      this.logger.debug(
        `Analyzing ${openFiles.length} open files for PID ${pid}, looking for ${targetDbFile}`
      )

      // 遍历打开的文件，寻找目标数据库文件
      for (const filePath of openFiles) {
        if (filePath.endsWith(targetDbFile)) {
          this.logger.info(`Found target database file: ${filePath}`)

          // 解析路径以提取数据目录和账户名
          const dataInfo = this.parseWeChatDataPath(filePath, version)
          if (dataInfo) {
            dataInfo.status = 'online' // 文件被进程打开，状态为在线
            this.logger.info(`Successfully extracted WeChat V${version} data info:`, dataInfo)
            return dataInfo
          }
        }
      }

      return null
    } catch (error) {
      this.logger.debug(`Error analyzing file handles for PID ${pid}:`, error)
      return null
    }
  }

  /**
   * 获取进程打开的文件列表
   */
  private async getProcessOpenFiles(pid: number): Promise<string[]> {
    // 尝试多种方法获取进程打开的文件
    const methods = [
      () => this.getProcessOpenFilesWithHandle(pid),
      () => this.getProcessOpenFilesWithPowerShell(pid)
    ]

    for (const method of methods) {
      try {
        const files = await method()
        if (files.length > 0) {
          this.logger.debug(`Successfully got ${files.length} open files for PID ${pid}`)
          return files
        }
      } catch (error) {
        this.logger.debug(`Method failed for PID ${pid}:`, error)
      }
    }

    return []
  }

  /**
   * 方法1: 使用项目中的 handle.exe 工具
   */
  private async getProcessOpenFilesWithHandle(pid: number): Promise<string[]> {
    try {
      // 使用 Electron 应用资源目录中的 handle.exe
      const handleExePath = getHandleExePath()

      if (!fs.existsSync(handleExePath)) {
        this.logger.debug(`handle.exe not found at ${handleExePath}`)
        throw new Error('handle.exe not found')
      }

      const { stdout } = await execa(handleExePath, ['-p', pid.toString(), '-nobanner'], {
        timeout: 15000
      })

      const files: string[] = []
      const lines = stdout.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && trimmed.includes('File') && trimmed.includes('\\')) {
          // handle.exe 输出格式解析
          let filePath: string | null = null

          // 模式1: 标准格式 File (权限) 路径
          const match1 = trimmed.match(/File\s+\([^)]*\)\s+(.+)$/)
          if (match1) {
            filePath = match1[1].trim()
          }

          // 模式2: 简化格式 File 路径
          if (!filePath) {
            const match2 = trimmed.match(/File\s+(.+)$/)
            if (match2) {
              filePath = match2[1].trim()
            }
          }

          // 模式3: 分词解析
          if (!filePath) {
            const parts = trimmed.split(/\s+/)
            for (let i = 0; i < parts.length; i++) {
              if (parts[i] === 'File' && i + 1 < parts.length) {
                let pathIndex = i + 1
                if (parts[pathIndex].startsWith('(') && parts[pathIndex].endsWith(')')) {
                  pathIndex++
                }
                if (pathIndex < parts.length) {
                  filePath = parts.slice(pathIndex).join(' ')
                }
                break
              }
            }
          }

          if (filePath && filePath.length > 0 && !filePath.includes('<')) {
            files.push(filePath)
          }
        }
      }

      this.logger.info(`handle.exe found ${files.length} files for PID ${pid}`)
      return files
    } catch (error) {
      this.logger.debug(`handle.exe method failed for PID ${pid}:`, error)
      throw error
    }
  }

  /**
   * 方法2: 使用 PowerShell 和 .NET API
   */
  private async getProcessOpenFilesWithPowerShell(pid: number): Promise<string[]> {
    try {
      const { stdout } = await execa(
        'powershell',
        [
          '-Command',
          `
        try {
          # 获取进程对象
          $process = Get-Process -Id ${pid} -ErrorAction Stop
          $files = @()

          # 尝试获取进程模块
          try {
            $modules = $process.Modules
            foreach ($module in $modules) {
              if ($module.FileName -and $module.FileName.Length -gt 0) {
                $files += $module.FileName
              }
            }
          } catch {
            # 模块访问失败，尝试其他方法
          }

          # 尝试使用 WMI 获取更多信息
          try {
            $wmiProcess = Get-WmiObject -Class Win32_Process -Filter "ProcessId = ${pid}"
            if ($wmiProcess -and $wmiProcess.ExecutablePath) {
              $files += $wmiProcess.ExecutablePath
            }
          } catch {
            # WMI 访问失败
          }

          # 输出所有找到的文件路径
          $files | Sort-Object -Unique | ForEach-Object {
            if ($_ -and $_.Length -gt 0) {
              Write-Output $_
            }
          }
        } catch {
          # 如果所有方法都失败，至少尝试获取可执行文件路径
          try {
            $proc = Get-Process -Id ${pid} -ErrorAction Stop
            if ($proc.Path) {
              Write-Output $proc.Path
            }
          } catch {
            # 完全失败
          }
        }
        `
        ],
        { timeout: 10000 }
      )

      const files = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line.length > 0)

      this.logger.debug(`PowerShell found ${files.length} files for PID ${pid}`)
      return files
    } catch (error) {
      this.logger.debug(`PowerShell method failed for PID ${pid}:`, error)
      throw error
    }
  }

  /**
   * 解析微信数据库文件路径，提取数据目录和账户名
   */
  private parseWeChatDataPath(filePath: string, version: number): WeChatDataInfo | null {
    try {
      // 移除 Windows 路径前缀 "\\?\" (如果存在)
      let cleanPath = filePath
      if (cleanPath.startsWith('\\\\?\\')) {
        cleanPath = cleanPath.substring(4)
      }

      // 按路径分隔符分割路径
      const parts = cleanPath.split(path.sep).filter((part) => part.length > 0)

      if (parts.length < 4) {
        this.logger.debug(`Path too short for parsing: ${filePath}`)
        return null
      }

      let dataDir: string
      let accountName: string

      if (version === 4) {
        // V4版本: DataDir = 前(len-3)部分, AccountName = 倒数第4个部分
        if (parts.length < 4) {
          this.logger.debug(`V4 path too short: ${filePath}`)
          return null
        }

        dataDir = parts.slice(0, parts.length - 3).join(path.sep)
        accountName = parts[parts.length - 4]
      } else {
        // V3版本: DataDir = 前(len-2)部分, AccountName = 倒数第3个部分
        if (parts.length < 3) {
          this.logger.debug(`V3 path too short: ${filePath}`)
          return null
        }

        dataDir = parts.slice(0, parts.length - 2).join(path.sep)
        accountName = parts[parts.length - 3]
      }

      // 验证提取的信息
      if (!dataDir || !accountName) {
        this.logger.debug(`Failed to extract data from path: ${filePath}`)
        return null
      }

      this.logger.debug(`Parsed WeChat V${version} path:`)
      this.logger.debug(`  Original: ${filePath}`)
      this.logger.debug(`  DataDir: ${dataDir}`)
      this.logger.debug(`  AccountName: ${accountName}`)

      return {
        dataDir,
        accountName,
        version,
        status: 'online'
      }
    } catch (error) {
      this.logger.error(`Error parsing WeChat data path ${filePath}:`, error)
      return null
    }
  }
}
