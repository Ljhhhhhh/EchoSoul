import { useState, useEffect } from 'react'
import { isInitializationCompletedLocally, clearInitializationStatus } from '@/utils/initializationStorage'

export type InitializationStatus = 'checking' | 'completed' | 'incomplete'

export const useInitializationStatus = () => {
  const [status, setStatus] = useState<InitializationStatus>('checking')

  // 检查工作目录下是否有解密后的数据
  const checkDecryptedData = async () => {
    try {
      const hasDecryptedData = await window.api.initialization.hasDecryptedData()
      return hasDecryptedData
    } catch (error) {
      console.error('检查解密数据失败:', error)
      return false
    }
  }

  // 执行完整的初始化状态检查
  const checkInitializationStatus = async () => {
    const isCompletedLocally = isInitializationCompletedLocally()

    if (isCompletedLocally) {
      const hasData = await checkDecryptedData()
      if (hasData) {
        setStatus('completed')
      } else {
        clearInitializationStatus()
        setStatus('incomplete')
      }
    } else {
      setStatus('incomplete')
    }
  }

  // 初始检查
  useEffect(() => {
    checkInitializationStatus()
  }, [])

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'initialization_completed') {
        checkInitializationStatus()
      }
    }

    // 监听 storage 事件
    window.addEventListener('storage', handleStorageChange)

    // 监听自定义事件（用于同一页面内的状态变化）
    const handleCustomStorageChange = () => {
      checkInitializationStatus()
    }
    window.addEventListener('initializationStatusChanged', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('initializationStatusChanged', handleCustomStorageChange)
    }
  }, [])

  return {
    status,
    recheckStatus: checkInitializationStatus
  }
}
