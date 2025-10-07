/**
 * 资源文件导入
 * 使用 electron-vite 推荐的方式导入资源文件
 * 遵循文档：https://cn.electron-vite.org/guide/assets
 */

// 图标资源
import iconPng from '../../../resources/icon.png?asset'

// Windows 可执行文件 - 使用 asarUnpack 确保在生产环境中可用
import handleExe from '../../../resources/handle.exe?asset&asarUnpack'

// chatlog 可执行文件 - 根据平台导入对应的可执行文件
import chatlogMac from '../../../resources/chatlog_mac/chatlog?asset&asarUnpack'
import chatlogWindows from '../../../resources/chatlog_windows/chatlog.exe?asset&asarUnpack'

// License 文件
import chatlogMacLicense from '../../../resources/chatlog_mac/LICENSE?asset'
import chatlogWindowsLicense from '../../../resources/chatlog_windows/LICENSE?asset'

// README 文件
import chatlogMacReadme from '../../../resources/chatlog_mac/README.md?asset'
import chatlogWindowsReadme from '../../../resources/chatlog_windows/README.md?asset'

/**
 * 获取应用图标路径
 */
export function getIconPath(): string {
  return iconPng
}

/**
 * 获取 handle.exe 路径
 */
export function getHandleExePath(): string {
  return handleExe
}

/**
 * 获取 chatlog 可执行文件路径
 * 根据当前平台返回对应的可执行文件路径
 */
export function getChatlogProgramPath(): string {
  const platform = process.platform

  if (platform === 'win32') {
    return chatlogWindows
  } else if (platform === 'darwin') {
    return chatlogMac
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * 获取 chatlog LICENSE 文件路径
 */
export function getChatlogLicensePath(): string {
  const platform = process.platform

  if (platform === 'win32') {
    return chatlogWindowsLicense
  } else if (platform === 'darwin') {
    return chatlogMacLicense
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * 获取 chatlog README 文件路径
 */
export function getChatlogReadmePath(): string {
  const platform = process.platform

  if (platform === 'win32') {
    return chatlogWindowsReadme
  } else if (platform === 'darwin') {
    return chatlogMacReadme
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * 获取所有资源文件信息
 */
export function getResourcesInfo() {
  return {
    icon: iconPng,
    handleExe: handleExe,
    chatlog: {
      mac: chatlogMac,
      windows: chatlogWindows,
      license: {
        mac: chatlogMacLicense,
        windows: chatlogWindowsLicense
      },
      readme: {
        mac: chatlogMacReadme,
        windows: chatlogWindowsReadme
      }
    }
  }
}

// 向后兼容的导出
export const resourcePaths = {
  getIconPath,
  getHandleExePath,
  getChatlogProgramPath,
  getChatlogLicensePath,
  getChatlogReadmePath,
  getResourcesInfo
}
