import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { createLogger } from './logger'

const logger = createLogger('ResourceManager')

/**
 * 资源管理器
 * 负责管理应用资源文件的路径，支持开发环境和生产环境
 */
export class ResourceManager {
  private static instance: ResourceManager
  private resourcesPath: string

  private constructor() {
    this.resourcesPath = this.determineResourcesPath()
    logger.info(`Resources path: ${this.resourcesPath}`)
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager()
    }
    return ResourceManager.instance
  }

  /**
   * 确定资源目录路径
   */
  private determineResourcesPath(): string {
    if (app.isPackaged) {
      // 生产环境：使用 Electron 的资源目录
      return process.resourcesPath
    } else {
      // 开发环境：使用项目根目录下的 resources 目录
      return path.join(__dirname, '../../resources')
    }
  }

  /**
   * 获取资源文件的完整路径
   */
  public getResourcePath(relativePath: string): string {
    return path.join(this.resourcesPath, relativePath)
  }

  /**
   * 检查资源文件是否存在
   */
  public resourceExists(relativePath: string): boolean {
    const fullPath = this.getResourcePath(relativePath)
    return fs.existsSync(fullPath)
  }

  /**
   * 获取 handle.exe 的路径
   */
  public getHandleExePath(): string {
    logger.info(app.getAppPath(), 'get app path')
    return this.getResourcePath('handle.exe')
  }

  /**
   * 获取 chatlog 可执行文件的路径
   */
  public getChatlogExePath(): string {
    const platform = process.platform
    let executableName: string

    if (platform === 'win32') {
      executableName = 'chatlog.exe'
    } else {
      executableName = 'chatlog'
    }

    return this.getResourcePath(executableName)
  }

  /**
   * 列出资源目录中的所有文件
   */
  public listResources(): string[] {
    try {
      if (fs.existsSync(this.resourcesPath)) {
        return fs.readdirSync(this.resourcesPath)
      }
    } catch (error) {
      logger.error('Error listing resources:', error)
    }
    return []
  }

  /**
   * 获取资源目录信息
   */
  public getResourcesInfo(): {
    path: string
    exists: boolean
    isPackaged: boolean
    files: string[]
  } {
    return {
      path: this.resourcesPath,
      exists: fs.existsSync(this.resourcesPath),
      isPackaged: app.isPackaged,
      files: this.listResources()
    }
  }

  /**
   * 验证所有必需的资源文件
   */
  public validateResources(): {
    valid: boolean
    missing: string[]
    found: string[]
  } {
    const requiredResources = [
      'handle.exe'
      // 可以添加其他必需的资源文件
    ]

    const missing: string[] = []
    const found: string[] = []

    for (const resource of requiredResources) {
      if (this.resourceExists(resource)) {
        found.push(resource)
      } else {
        missing.push(resource)
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      found
    }
  }
}

// 导出单例实例
export const resourceManager = ResourceManager.getInstance()

// 便捷函数
export function getResourcePath(relativePath: string): string {
  return resourceManager.getResourcePath(relativePath)
}

export function getHandleExePath(): string {
  return resourceManager.getHandleExePath()
}

export function getChatlogExePath(): string {
  return resourceManager.getChatlogExePath()
}

export function validateResources() {
  return resourceManager.validateResources()
}
