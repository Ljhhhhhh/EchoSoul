import { createLogger } from '../utils/logger'
import type { ChatMessage, Contact, ChatlogStatus } from '@types'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { app } from 'electron'
import { setExecutablePermission } from '../utils'
import { ChatlogHttpClient } from './ChatlogHttpClient'
import Store from 'electron-store'
import { execa } from 'execa'
import { getHandleExePath } from '../utils/resourceManager'

const logger = createLogger('ChatlogService')

// 微信版本常量
const WECHAT_CONSTANTS = {
  // Windows 进程名
  V3_PROCESS_NAMES: ['WeChat.exe'], // 支持多种V3进程名
  V4_PROCESS_NAME: 'Weixin.exe',
  // 数据库文件路径
  V3_DB_FILE: 'Msg\\Misc.db',
  V4_DB_FILE: 'db_storage\\session\\session.db',
  // macOS 数据库文件路径
  V3_DB_FILE_MAC: 'Message/msg_0.db',
  V4_DB_FILE_MAC: 'db_storage/session/session.db'
} as const

// 微信数据目录信息接口
interface WeChatDataInfo {
  dataDir: string
  accountName: string
  version: number
  status: 'online' | 'offline'
}

interface ChatlogConfig {
  wechatKey?: string
  workDir?: string
  baseUrl?: string
}

export class ChatlogService {
  private baseUrl = 'http://127.0.0.1:5030' // chatlog默认端口
  private chatlogProcess: ChildProcess | null = null
  private chatlogPath: string
  private isInitialized = false
  private httpClient: ChatlogHttpClient
  private store: Store<ChatlogConfig>

  // 从配置中加载的微信密钥
  private wechatKey: string = ''

  constructor() {
    // 初始化配置存储
    this.store = new Store<ChatlogConfig>({
      name: 'chatlog-config',
      defaults: {
        baseUrl: this.baseUrl
      }
    })

    // 从配置中加载设置
    const savedBaseUrl = this.store.get('baseUrl')
    if (savedBaseUrl) {
      this.baseUrl = savedBaseUrl
    }

    const savedKey = this.store.get('wechatKey')
    if (savedKey) {
      this.wechatKey = savedKey
    }

    // 初始化 HTTP 客户端
    this.httpClient = new ChatlogHttpClient(this.baseUrl)

    // 根据平台选择对应的chatlog可执行文件
    const platform = process.platform

    // 在开发环境中，从项目根目录的resources查找
    // 在生产环境中，从app.asar.unpacked的resources查找
    let resourcesPath: string
    if (app.isPackaged) {
      resourcesPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'resources')
    } else {
      // 开发环境：从项目根目录的resources查找
      resourcesPath = path.join(process.cwd(), 'resources')
    }

    if (platform === 'darwin') {
      this.chatlogPath = path.join(resourcesPath, 'chatlog_mac', 'chatlog')
    } else if (platform === 'win32') {
      this.chatlogPath = path.join(resourcesPath, 'chatlog_windows', 'chatlog.exe')
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  async initialize() {
    try {
      // 检查chatlog可执行文件是否存在
      if (!fs.existsSync(this.chatlogPath)) {
        throw new Error(`Chatlog executable not found at: ${this.chatlogPath}`)
      }

      // 在macOS上设置执行权限
      if (process.platform === 'darwin') {
        await setExecutablePermission(this.chatlogPath)
      }

      logger.info(`ChatlogService initialized with executable: ${this.chatlogPath}`)
      this.isInitialized = true
    } catch (error) {
      logger.error('Failed to initialize ChatlogService:', error)
      throw error
    }
  }

  /**
   * 获取chatlog解密后的数据目录
   * 优先使用用户选择的目录，否则使用默认目录
   */
  private getChatlogWorkDir(): string {
    const homeDir = os.homedir()

    // 优先使用用户配置的工作目录
    const savedWorkDir = this.store.get('workDir')
    const workDir = savedWorkDir || path.join(homeDir, 'Documents', 'EchoSoul', 'chatlog_data')

    // 确保目录存在
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true })
      logger.info(`Created chatlog data directory: ${workDir}`)
    }

    return workDir
  }

  /**
   * 设置工作目录
   */
  setWorkDir(workDir: string): void {
    this.store.set('workDir', workDir)
    logger.info(`Work directory set to: ${workDir}`)
  }

  /**
   * 获取当前工作目录
   */
  getWorkDir(): string {
    return this.getChatlogWorkDir()
  }

  /**
   * 动态检测微信数据目录
   * 基于chatlog源码的实现，支持Windows和macOS平台
   * 通过分析微信进程打开的数据库文件来推断数据目录位置
   */
  async detectWeChatDataPath(): Promise<WeChatDataInfo | null> {
    try {
      if (process.platform === 'win32') {
        return await this.detectWeChatDataPathWindows()
      } else if (process.platform === 'darwin') {
        return await this.detectWeChatDataPathMacOS()
      } else {
        logger.warn(`Unsupported platform: ${process.platform}`)
        return null
      }
    } catch (error) {
      logger.error('Error detecting WeChat data path:', error)
      return null
    }
  }

  /**
   * Windows平台检测微信数据目录
   */
  private async detectWeChatDataPathWindows(): Promise<WeChatDataInfo | null> {
    try {
      // 使用 Windows 系统命令获取进程列表
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

      logger.info(`FindWechatProcess ${JSON.stringify(wechatProcesses)}`)

      if (wechatProcesses.length === 0) {
        logger.warn('No WeChat process found on Windows')
        return null
      }

      // 对每个微信进程，尝试检测数据目录
      for (const proc of wechatProcesses) {
        const dataInfo = await this.getWeChatDataInfoWindows(proc)
        if (dataInfo) {
          return dataInfo
        }
      }

      return null
    } catch (error) {
      logger.error('Error detecting WeChat data path on Windows:', error)
      return null
    }
  }

  /**
   * 使用 Windows 系统命令获取进程列表
   */
  private async getWindowsProcesses(): Promise<Array<{ pid: number; name: string }>> {
    try {
      // 使用 tasklist 命令获取进程列表
      const { stdout } = await execa('tasklist', ['/fo', 'csv', '/nh'])

      const processes: Array<{ pid: number; name: string }> = []
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
      logger.error('Error getting Windows processes:', error)
      return []
    }
  }

  /**
   * 获取Windows平台微信数据信息
   */
  private async getWeChatDataInfoWindows(proc: any): Promise<WeChatDataInfo | null> {
    try {
      const processName = proc.name.toLowerCase()

      // 判断微信版本
      const isV3Process = WECHAT_CONSTANTS.V3_PROCESS_NAMES.some(
        (v3Name) => processName === v3Name.toLowerCase()
      )
      const isV4Process = processName === WECHAT_CONSTANTS.V4_PROCESS_NAME.toLowerCase()

      let version: number
      if (isV3Process) {
        version = 3
        logger.info(`Detected WeChat V3 process: ${processName} (PID: ${proc.pid})`)
      } else if (isV4Process) {
        version = 4
        logger.info(`Detected WeChat V4 process: ${processName} (PID: ${proc.pid})`)
      } else {
        logger.warn(`Unknown WeChat process: ${processName}`)
        return null
      }

      // 对于V4版本，需要排除子进程
      if (isV4Process) {
        try {
          // 使用 wmic 获取进程命令行
          const { stdout } = await execa('wmic', [
            'process',
            'where',
            `ProcessId=${proc.pid}`,
            'get',
            'CommandLine',
            '/format:value'
          ])

          if (stdout.includes('--')) {
            logger.debug(`Skipping WeChat V4 subprocess with PID ${proc.pid}`)
            return null
          }
        } catch (error) {
          logger.debug(`Failed to get command line for PID ${proc.pid}:`, error)
        }
      }

      // 搜索可能的数据目录
      const dataInfo = await this.searchWeChatDataDirectoryWindows(version)
      if (dataInfo) {
        dataInfo.status = 'online' // 进程在运行，状态为在线
        logger.info(`Found WeChat V${version} data directory: ${dataInfo.dataDir}`)
        return dataInfo
      }

      logger.debug(`No data directory found for WeChat V${version} process ${proc.pid}`)
      return null
    } catch (error) {
      logger.debug(`Error getting WeChat data info for PID ${proc.pid}:`, error)
      return null
    }
  }

  /**
   * 搜索Windows平台微信数据目录
   * 基于 chatlog Go 项目的实现，通过分析进程打开的文件句柄来动态发现数据目录
   */
  private async searchWeChatDataDirectoryWindows(version: number): Promise<WeChatDataInfo | null> {
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
        logger.debug('No WeChat processes found for file handle analysis')
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
      logger.error('Error searching WeChat data directory on Windows:', error)
      return null
    }
  }

  /**
   * 分析进程打开的文件句柄，寻找微信数据库文件
   * 这是核心方法，复现了 Go 项目中 initializeProcessInfo 的逻辑
   */
  private async analyzeProcessFileHandles(
    pid: number,
    version: number
  ): Promise<WeChatDataInfo | null> {
    try {
      // 使用 PowerShell 获取进程打开的文件句柄
      const openFiles = await this.getProcessOpenFiles(pid)

      // 根据版本确定目标数据库文件
      const targetDbFile = version === 4 ? WECHAT_CONSTANTS.V4_DB_FILE : WECHAT_CONSTANTS.V3_DB_FILE

      logger.debug(
        `Analyzing ${openFiles.length} open files for PID ${pid}, looking for ${targetDbFile}`
      )

      // 遍历打开的文件，寻找目标数据库文件
      for (const filePath of openFiles) {
        if (filePath.endsWith(targetDbFile)) {
          logger.info(`Found target database file: ${filePath}`)

          // 解析路径以提取数据目录和账户名
          const dataInfo = this.parseWeChatDataPath(filePath, version)
          if (dataInfo) {
            dataInfo.status = 'online' // 文件被进程打开，状态为在线
            logger.info(`Successfully extracted WeChat V${version} data info:`, dataInfo)
            return dataInfo
          }
        }
      }

      return null
    } catch (error) {
      logger.debug(`Error analyzing file handles for PID ${pid}:`, error)
      return null
    }
  }

  /**
   * 获取进程打开的文件列表
   * 使用多种方法来获取文件句柄信息，尽可能接近 Go 项目的 process.OpenFiles() 功能
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
          logger.debug(`Successfully got ${files.length} open files for PID ${pid}`)
          return files
        }
      } catch (error) {
        logger.debug(`Method failed for PID ${pid}:`, error)
      }
    }

    return []
  }

  /**
   * 方法1: 使用项目中的 handle.exe 工具
   * 这是最接近 Go 项目 process.OpenFiles() 的方法
   */
  private async getProcessOpenFilesWithHandle(pid: number): Promise<string[]> {
    try {
      // 使用 Electron 应用资源目录中的 handle.exe
      const handleExePath = getHandleExePath()

      if (!fs.existsSync(handleExePath)) {
        logger.debug(`handle.exe not found at ${handleExePath}`)
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

      logger.info(`handle.exe found ${files.length} files for PID ${pid}`)
      return files
    } catch (error) {
      logger.debug(`handle.exe method failed for PID ${pid}:`, error)
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

      logger.debug(`PowerShell found ${files.length} files for PID ${pid}`)
      return files
    } catch (error) {
      logger.debug(`PowerShell method failed for PID ${pid}:`, error)
      throw error
    }
  }

  /**
   * 解析微信数据库文件路径，提取数据目录和账户名
   * 完全复现 Go 项目中的路径解析算法
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
        logger.debug(`Path too short for parsing: ${filePath}`)
        return null
      }

      let dataDir: string
      let accountName: string

      if (version === 4) {
        // V4版本: DataDir = 前(len-3)部分, AccountName = 倒数第4个部分
        // 例如: C:\Users\Username\Documents\WeChat Files\wxid_abc123\db_storage\session\session.db
        // parts: ["C:", "Users", "Username", "Documents", "WeChat Files", "wxid_abc123", "db_storage", "session", "session.db"]
        // DataDir: C:\Users\Username\Documents\WeChat Files\wxid_abc123 (前 len-3 = 前6部分)
        // AccountName: wxid_abc123 (倒数第4个 = parts[5])

        if (parts.length < 4) {
          logger.debug(`V4 path too short: ${filePath}`)
          return null
        }

        dataDir = parts.slice(0, parts.length - 3).join(path.sep)
        accountName = parts[parts.length - 4]
      } else {
        // V3版本: DataDir = 前(len-2)部分, AccountName = 倒数第3个部分
        // 例如: C:\Users\Username\Documents\WeChat Files\wxid_abc123\Msg\Misc.db
        // parts: ["C:", "Users", "Username", "Documents", "WeChat Files", "wxid_abc123", "Msg", "Misc.db"]
        // DataDir: C:\Users\Username\Documents\WeChat Files\wxid_abc123 (前 len-2 = 前6部分)
        // AccountName: wxid_abc123 (倒数第3个 = parts[5])

        if (parts.length < 3) {
          logger.debug(`V3 path too short: ${filePath}`)
          return null
        }

        dataDir = parts.slice(0, parts.length - 2).join(path.sep)
        accountName = parts[parts.length - 3]
      }

      // 验证提取的信息
      if (!dataDir || !accountName) {
        logger.debug(`Failed to extract data from path: ${filePath}`)
        return null
      }

      logger.debug(`Parsed WeChat V${version} path:`)
      logger.debug(`  Original: ${filePath}`)
      logger.debug(`  DataDir: ${dataDir}`)
      logger.debug(`  AccountName: ${accountName}`)

      return {
        dataDir,
        accountName,
        version,
        status: 'online'
      }
    } catch (error) {
      logger.error(`Error parsing WeChat data path ${filePath}:`, error)
      return null
    }
  }

  /**
   * macOS平台检测微信数据目录
   */
  private async detectWeChatDataPathMacOS(): Promise<WeChatDataInfo | null> {
    try {
      // 查找微信进程
      const wechatPids = await this.findWeChatProcessesMacOS()
      if (wechatPids.length === 0) {
        logger.warn('No WeChat process found on macOS')
        return null
      }

      // 对每个微信进程，使用lsof获取打开的文件
      for (const pid of wechatPids) {
        const dataInfo = await this.getWeChatDataInfoFromProcessMacOS(pid)
        if (dataInfo) {
          return dataInfo
        }
      }

      return null
    } catch (error) {
      logger.error('Error detecting WeChat data path on macOS:', error)
      return null
    }
  }

  /**
   * 查找macOS平台微信进程PID
   */
  private async findWeChatProcessesMacOS(): Promise<number[]> {
    try {
      const { stdout } = await execa('pgrep', ['-f', 'WeChat|Weixin'])
      const pids = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((pid) => parseInt(pid.trim()))
        .filter((pid) => !isNaN(pid))
      return pids
    } catch (error) {
      // pgrep没找到进程时会返回错误，这是正常的
      return []
    }
  }

  /**
   * 从macOS微信进程获取数据信息
   */
  private async getWeChatDataInfoFromProcessMacOS(pid: number): Promise<WeChatDataInfo | null> {
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
            logger.info(`Detected WeChat v3 data directory: ${dataDir}`)
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
            logger.info(`Detected WeChat v4 data directory: ${dataDir}`)
            return {
              dataDir,
              accountName,
              version: 4,
              status: 'online'
            }
          }
        }
      }

      return null
    } catch (error) {
      logger.debug(`Error getting WeChat data info from process ${pid}:`, error)
      return null
    }
  }

  /**
   * 检测微信版本
   */
  private async detectWeChatVersion(dataPath: string): Promise<number> {
    try {
      // 检查是否存在v4版本的特征文件
      const v4Indicators = ['db_storage/session/session.db', 'db_storage']

      for (const indicator of v4Indicators) {
        const indicatorPath = path.join(dataPath, indicator)
        if (fs.existsSync(indicatorPath)) {
          logger.info('Detected WeChat v4 based on file structure')
          return 4
        }
      }

      // 检查是否存在v3版本的特征文件
      const v3Indicators = ['Message/msg_0.db', 'Message']

      for (const indicator of v3Indicators) {
        const indicatorPath = path.join(dataPath, indicator)
        if (fs.existsSync(indicatorPath)) {
          logger.info('Detected WeChat v3 based on file structure')
          return 3
        }
      }

      // 默认返回v3
      logger.warn('Could not detect WeChat version, defaulting to v3')
      return 3
    } catch (error) {
      logger.warn('Error detecting WeChat version:', error)
      return 3
    }
  }

  async checkStatus(): Promise<ChatlogStatus> {
    try {
      // 使用 HTTP 客户端检查服务状态
      const isRunning = await this.httpClient.checkServiceStatus()
      return isRunning ? 'running' : 'not-running'
    } catch (error) {
      logger.debug('Chatlog service not running:', error)
      return 'not-running'
    }
  }

  /**
   * 安全地检查服务状态，不会抛出异常
   */
  async checkStatusSafely(): Promise<ChatlogStatus> {
    try {
      return await this.checkStatus()
    } catch (error) {
      logger.debug('Safe status check failed:', error)
      return 'not-running'
    }
  }

  async startService(): Promise<boolean> {
    if (!this.isInitialized) {
      logger.error('ChatlogService not initialized')
      return false
    }

    if (this.chatlogProcess) {
      logger.info('Chatlog service already running')
      return true
    }

    try {
      logger.info(`Starting chatlog server by ${this.chatlogPath}`)

      // 获取解密后的数据目录
      const dataDir = this.getChatlogWorkDir()
      logger.info(`Using chatlog data directory: ${dataDir}`)

      // 启动chatlog server命令，需要指定work-dir参数
      this.chatlogProcess = spawn(
        this.chatlogPath,
        ['server', '--work-dir', dataDir, '--addr', '127.0.0.1:5030'],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          detached: false
        }
      )

      // 监听进程输出
      this.chatlogProcess.stdout?.on('data', (data) => {
        logger.debug(`Chatlog stdout: ${data.toString().trim()}`)
      })

      this.chatlogProcess.stderr?.on('data', (data) => {
        logger.warn(`Chatlog stderr: ${data.toString().trim()}`)
      })

      this.chatlogProcess.on('close', (code) => {
        logger.info(`Chatlog process exited with code ${code}`)
        this.chatlogProcess = null
      })

      this.chatlogProcess.on('error', (error) => {
        logger.error('Chatlog process error:', error)
        this.chatlogProcess = null
      })

      // 等待服务启动
      await this.waitForService()

      logger.info('Chatlog server started successfully')
      return true
    } catch (error) {
      logger.error('Failed to start chatlog service:', error)
      this.chatlogProcess = null
      return false
    }
  }

  async stopService(): Promise<void> {
    if (this.chatlogProcess) {
      logger.info('Stopping chatlog service...')
      this.chatlogProcess.kill('SIGTERM')
      this.chatlogProcess = null
    }
  }

  private async waitForService(maxAttempts = 10, interval = 1000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus()
      if (status === 'running') {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
    throw new Error('Chatlog service failed to start within timeout')
  }

  /**
   * 获取微信数据密钥
   */
  async getWechatKey(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return { success: false, message: 'ChatlogService not initialized' }
    }

    return new Promise((resolve) => {
      logger.info('Getting WeChat key...')

      const process = spawn(this.chatlogPath, ['key'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      process.on('close', (code) => {
        logger.info(`Get key process exited with code ${code}`)
        if (code === 0) {
          logger.info(`WeChat key obtained successfully: ${output.trim()}`)
          // 存储获取到的密钥
          this.wechatKey = output.trim()
          this.store.set('wechatKey', this.wechatKey)
          resolve({ success: true, message: output.trim() })
        } else {
          logger.error('Failed to get WeChat key:', errorOutput)
          resolve({
            success: false,
            message: errorOutput.trim() || 'Unknown error'
          })
        }
      })

      process.on('error', (error) => {
        logger.error('Error getting WeChat key:', error)
        resolve({ success: false, message: error.message })
      })
    })
  }

  /**
   * 解密数据库文件
   * 基于chatlog源码的解密逻辑重新实现，提供更好的错误处理和状态反馈
   */
  async decryptDatabase(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return { success: false, message: 'ChatlogService not initialized' }
    }

    if (!this.wechatKey) {
      return {
        success: false,
        message: 'WeChat key not obtained. Please get key first.'
      }
    }

    try {
      // 获取微信原始数据目录和解密后的数据目录
      const dataResult = await this.detectWeChatDataPath()
      const wechatSourceDir = dataResult?.dataDir
      const workDir = this.getChatlogWorkDir()
      // 验证源目录是否存在
      if (!wechatSourceDir || !fs.existsSync(wechatSourceDir)) {
        return {
          success: false,
          message: `WeChat data directory not found: ${wechatSourceDir}`
        }
      }

      logger.info('Starting database decryption...')
      logger.info(`Source directory (data-dir): ${wechatSourceDir}`)
      logger.info(`Target directory (work-dir): ${workDir}`)
      logger.info(`Key: ${this.wechatKey.substring(0, 10)}...`)

      // 动态检测微信版本
      const wechatVersion = await this.detectWeChatVersion(wechatSourceDir)
      logger.info(`Detected WeChat version: v${wechatVersion}`)

      return new Promise((resolve) => {
        const childProcess = spawn(
          this.chatlogPath,
          [
            'decrypt',
            '--data-dir',
            wechatSourceDir, // 微信原始数据目录
            '--work-dir',
            workDir,
            '--key',
            this.wechatKey
          ],
          {
            stdio: ['pipe', 'pipe', 'pipe']
          }
        )

        let output = ''
        let errorOutput = ''

        childProcess.stdout?.on('data', (data) => {
          output += data.toString()
        })

        childProcess.stderr?.on('data', (data) => {
          const text = data.toString().trim()
          errorOutput += text
          // 忽略 incorrect decryption key 的报错
          if (text !== 'incorrect decryption key') {
            logger.warn(`Decrypt stderr: ${text}`)
          }
        })

        childProcess.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: 'Database decryption completed successfully'
            })
          } else {
            logger.error('Database decryption failed')
            resolve({
              success: false,
              message: errorOutput
            })
          }
        })

        childProcess.on('error', (error) => {
          logger.error('Error starting decrypt process:', error)
          resolve({
            success: false,
            message: `Failed to start decryption process: ${error.message}`
          })
        })

        // 设置超时（5分钟）
        const timeout = setTimeout(
          () => {
            logger.warn('Decryption process timeout, killing process...')
            childProcess.kill('SIGTERM')
            resolve({
              success: false,
              message: 'Decryption process timed out after 5 minutes'
            })
          },
          5 * 60 * 1000
        )

        childProcess.on('close', () => {
          clearTimeout(timeout)
        })
      })
    } catch (error) {
      logger.error('Error in decryptDatabase:', error)
      return {
        success: false,
        message: `Decryption failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * 检查是否已有解密后的数据
   */
  private async checkDecryptedData(workDir: string): Promise<boolean> {
    try {
      // 检查工作目录是否存在且包含数据库文件
      if (!fs.existsSync(workDir)) {
        return false
      }

      // 递归查找.db文件
      const findDbFiles = (dir: string): string[] => {
        const files: string[] = []
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              files.push(...findDbFiles(fullPath))
            } else if (entry.name.endsWith('.db')) {
              files.push(fullPath)
            }
          }
        } catch (error) {
          logger.debug(`Error reading directory ${dir}:`, error)
        }
        return files
      }

      const dbFiles = findDbFiles(workDir)
      return dbFiles.length > 0
    } catch (error) {
      logger.debug('Error checking decrypted data:', error)
      return false
    }
  }

  /**
   * 检查chatlog是否已经初始化（密钥获取和数据库解密）
   */
  async checkInitialization(): Promise<{
    keyObtained: boolean
    databaseDecrypted: boolean
    canStartServer: boolean
  }> {
    try {
      // 检查是否有密钥
      const keyObtained = !!this.wechatKey

      // 检查是否有解密后的数据
      const workDir = this.getChatlogWorkDir()
      const databaseDecrypted = await this.checkDecryptedData(workDir)

      // 只有在有解密数据的情况下才检查服务状态
      let canStartServer = false
      if (databaseDecrypted) {
        const status = await this.checkStatus()
        canStartServer = status === 'running'
      }

      return {
        keyObtained,
        databaseDecrypted,
        canStartServer
      }
    } catch (error) {
      logger.debug('Error checking initialization:', error)
      return {
        keyObtained: !!this.wechatKey,
        databaseDecrypted: false,
        canStartServer: false
      }
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      return await this.httpClient.getContacts()
    } catch (error) {
      logger.error('Failed to get contacts:', error)
      return []
    }
  }

  async getMessages(params: {
    startDate: string
    endDate: string
    talker?: string
  }): Promise<ChatMessage[]> {
    try {
      return await this.httpClient.getMessages(params)
    } catch (error) {
      logger.error('Failed to get messages:', error)
      return []
    }
  }

  /**
   * 获取群聊信息
   */
  async getChatroomInfo(chatroomId: string) {
    try {
      return await this.httpClient.getChatroomInfo(chatroomId)
    } catch (error) {
      logger.error(`Failed to get chatroom info for ${chatroomId}:`, error)
      return null
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions() {
    try {
      return await this.httpClient.getSessions()
    } catch (error) {
      logger.error('Failed to get sessions:', error)
      return []
    }
  }

  /**
   * 更新 Chatlog 服务地址
   */
  updateServiceUrl(newUrl: string) {
    this.baseUrl = newUrl
    this.httpClient.updateBaseUrl(newUrl)
    logger.info(`Chatlog service URL updated to: ${newUrl}`)
  }

  async cleanup() {
    await this.stopService()
    logger.info('ChatlogService cleaned up')
  }
}
