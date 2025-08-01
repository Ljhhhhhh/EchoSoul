/**
 * 初始化状态本地存储管理工具
 */

const STORAGE_KEY = 'echosoul_initialization_completed'

export interface InitializationStorageData {
  completed: boolean
  timestamp: number
  version: string
}

/**
 * 获取本地存储的初始化状态
 */
export function getInitializationStatus(): InitializationStorageData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const data = JSON.parse(stored) as InitializationStorageData

    console.log(data, 'data !@!')

    // 验证数据结构
    if (
      typeof data.completed !== 'boolean' ||
      typeof data.timestamp !== 'number' ||
      typeof data.version !== 'string'
    ) {
      console.warn('初始化状态数据格式无效，清除本地存储')
      clearInitializationStatus()
      return null
    }

    return data
  } catch (error) {
    console.error('读取初始化状态失败:', error)
    clearInitializationStatus()
    return null
  }
}

/**
 * 保存初始化完成状态到本地存储
 */
export function setInitializationCompleted(): void {
  try {
    const data: InitializationStorageData = {
      completed: true,
      timestamp: Date.now(),
      version: '1.0.0' // 可以从package.json读取
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('初始化完成状态已保存到本地存储')

    // 触发自定义事件通知状态变化
    window.dispatchEvent(new CustomEvent('initializationStatusChanged'))
  } catch (error) {
    console.error('保存初始化状态失败:', error)
  }
}

/**
 * 清除本地存储的初始化状态
 */
export function clearInitializationStatus(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('初始化状态已从本地存储清除')

    // 触发自定义事件通知状态变化
    window.dispatchEvent(new CustomEvent('initializationStatusChanged'))
  } catch (error) {
    console.error('清除初始化状态失败:', error)
  }
}

/**
 * 检查本地状态是否表示已完成初始化
 */
export function isInitializationCompletedLocally(): boolean {
  const status = getInitializationStatus()
  return status?.completed === true
}

/**
 * 获取初始化完成的时间戳
 */
export function getInitializationTimestamp(): number | null {
  const status = getInitializationStatus()
  return status?.timestamp || null
}
