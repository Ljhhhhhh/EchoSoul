import { createLogger } from './logger'
import { ProcessUtils } from './processUtils'
import { ChatlogHttpClient } from '../services/ChatlogHttpClient'
import { getChatlogProgramPath } from './resources'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const logger = createLogger('ChatlogDiagnostics')

export interface DiagnosticResult {
  category: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: string
}

export class ChatlogDiagnostics {
  private httpClient: ChatlogHttpClient

  constructor(baseUrl: string = 'http://127.0.0.1:5030') {
    this.httpClient = new ChatlogHttpClient(baseUrl)
  }

  /**
   * 运行完整的诊断检查
   */
  async runFullDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    logger.info('开始运行 Chatlog 服务诊断...')

    // 1. 检查服务连接
    results.push(await this.checkServiceConnection())

    // 2. 检查 chatlog 可执行文件
    results.push(await this.checkChatlogExecutable())

    // 3. 检查数据目录
    results.push(await this.checkDataDirectory())

    // 4. 检查微信进程
    results.push(await this.checkWeChatProcess())

    // 5. 检查端口占用
    results.push(await this.checkPortUsage())

    // 6. 如果服务运行，检查 API 响应
    const serviceRunning = results[0].status === 'success'
    if (serviceRunning) {
      results.push(await this.checkApiEndpoints())
    }

    logger.info(`诊断完成，共检查 ${results.length} 项`)
    return results
  }

  /**
   * 检查服务连接
   */
  private async checkServiceConnection(): Promise<DiagnosticResult> {
    try {
      const isRunning = await this.httpClient.checkServiceStatus()

      if (isRunning) {
        return {
          category: '服务连接',
          status: 'success',
          message: 'Chatlog 服务正在运行',
          details: `服务地址: ${this.httpClient.getBaseUrl()}`
        }
      } else {
        return {
          category: '服务连接',
          status: 'error',
          message: 'Chatlog 服务未运行',
          details: '请启动 Chatlog 服务或检查服务配置'
        }
      }
    } catch (error: any) {
      return {
        category: '服务连接',
        status: 'error',
        message: '无法连接到 Chatlog 服务',
        details: error.message
      }
    }
  }

  /**
   * 检查 chatlog 可执行文件
   */
  private async checkChatlogExecutable(): Promise<DiagnosticResult> {
    try {
      const platform = process.platform

      if (platform !== 'darwin' && platform !== 'win32') {
        return {
          category: 'Chatlog 可执行文件',
          status: 'error',
          message: `不支持的平台: ${platform}`
        }
      }

      // 使用新的资源导入方式获取 chatlog 可执行文件路径
      const chatlogPath = getChatlogProgramPath()

      if (fs.existsSync(chatlogPath)) {
        const stats = fs.statSync(chatlogPath)
        return {
          category: 'Chatlog 可执行文件',
          status: 'success',
          message: 'Chatlog 可执行文件存在',
          details: `路径: ${chatlogPath}, 大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
        }
      } else {
        return {
          category: 'Chatlog 可执行文件',
          status: 'error',
          message: 'Chatlog 可执行文件不存在',
          details: `预期路径: ${chatlogPath}`
        }
      }
    } catch (error: any) {
      return {
        category: 'Chatlog 可执行文件',
        status: 'error',
        message: '检查可执行文件时出错',
        details: error.message
      }
    }
  }

  /**
   * 检查数据目录
   */
  private async checkDataDirectory(): Promise<DiagnosticResult> {
    try {
      const homeDir = os.homedir()
      const workDir = path.join(homeDir, 'Documents', 'EchoSoul', 'chatlog_data')

      if (!fs.existsSync(workDir)) {
        return {
          category: '数据目录',
          status: 'warning',
          message: '数据目录不存在',
          details: `预期路径: ${workDir}。需要先解密微信数据库。`
        }
      }

      // 检查是否有数据库文件
      const dbFiles = this.findDbFiles(workDir)

      if (dbFiles.length > 0) {
        return {
          category: '数据目录',
          status: 'success',
          message: `找到 ${dbFiles.length} 个数据库文件`,
          details: `数据目录: ${workDir}`
        }
      } else {
        return {
          category: '数据目录',
          status: 'warning',
          message: '数据目录存在但没有数据库文件',
          details: `目录: ${workDir}。可能需要重新解密数据库。`
        }
      }
    } catch (error: any) {
      return {
        category: '数据目录',
        status: 'error',
        message: '检查数据目录时出错',
        details: error.message
      }
    }
  }

  /**
   * 检查微信进程
   */
  private async checkWeChatProcess(): Promise<DiagnosticResult> {
    try {
      const pids = await this.findWeChatProcesses()

      if (pids.length > 0) {
        return {
          category: '微信进程',
          status: 'success',
          message: `找到 ${pids.length} 个微信进程`,
          details: `进程 ID: ${pids.join(', ')}`
        }
      } else {
        return {
          category: '微信进程',
          status: 'warning',
          message: '未找到微信进程',
          details: '请确保微信正在运行'
        }
      }
    } catch (error: any) {
      return {
        category: '微信进程',
        status: 'error',
        message: '检查微信进程时出错',
        details: error.message
      }
    }
  }

  /**
   * 检查端口占用
   */
  private async checkPortUsage(): Promise<DiagnosticResult> {
    try {
      const port = 5030
      const isPortInUse = await this.isPortInUse(port)

      if (isPortInUse) {
        return {
          category: '端口检查',
          status: 'success',
          message: `端口 ${port} 正在使用中`,
          details: '这通常表示 Chatlog 服务正在运行'
        }
      } else {
        return {
          category: '端口检查',
          status: 'warning',
          message: `端口 ${port} 未被使用`,
          details: 'Chatlog 服务可能没有启动'
        }
      }
    } catch (error: any) {
      return {
        category: '端口检查',
        status: 'error',
        message: '检查端口占用时出错',
        details: error.message
      }
    }
  }

  /**
   * 检查 API 端点
   */
  private async checkApiEndpoints(): Promise<DiagnosticResult> {
    const endpoints = ['/api/v1/contact', '/api/v1/session']

    const results: string[] = []
    let successCount = 0

    for (const endpoint of endpoints) {
      try {
        await this.httpClient.get(endpoint, { timeout: 5000 } as any)
        results.push(`✓ ${endpoint}`)
        successCount++
      } catch (error: any) {
        results.push(`✗ ${endpoint}: ${error.message}`)
      }
    }

    if (successCount === endpoints.length) {
      return {
        category: 'API 端点',
        status: 'success',
        message: `所有 ${endpoints.length} 个 API 端点正常`,
        details: results.join('\n')
      }
    } else if (successCount > 0) {
      return {
        category: 'API 端点',
        status: 'warning',
        message: `${successCount}/${endpoints.length} 个 API 端点正常`,
        details: results.join('\n')
      }
    } else {
      return {
        category: 'API 端点',
        status: 'error',
        message: '所有 API 端点都无法访问',
        details: results.join('\n')
      }
    }
  }

  // 辅助方法

  private findDbFiles(dir: string): string[] {
    const files: string[] = []
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...this.findDbFiles(fullPath))
        } else if (entry.name.endsWith('.db')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
    return files
  }

  private async findWeChatProcesses(): Promise<number[]> {
    return await ProcessUtils.findWeChatProcesses()
  }

  private async isPortInUse(port: number): Promise<boolean> {
    return await ProcessUtils.isPortInUse(port)
  }

  /**
   * 生成诊断报告
   */
  generateReport(results: DiagnosticResult[]): string {
    const lines: string[] = []
    lines.push('=== Chatlog 服务诊断报告 ===')
    lines.push(`生成时间: ${new Date().toLocaleString()}`)
    lines.push('')

    const successCount = results.filter((r) => r.status === 'success').length
    const warningCount = results.filter((r) => r.status === 'warning').length
    const errorCount = results.filter((r) => r.status === 'error').length

    lines.push(`总结: ${successCount} 成功, ${warningCount} 警告, ${errorCount} 错误`)
    lines.push('')

    for (const result of results) {
      const icon = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗'
      lines.push(`${icon} ${result.category}: ${result.message}`)
      if (result.details) {
        lines.push(`   详情: ${result.details}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }
}
