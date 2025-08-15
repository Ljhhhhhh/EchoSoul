import { createLogger } from '../utils/logger'
import type { TaskStatus } from '@types'
import { DatabaseService } from './DatabaseService'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger('TaskManager')

/**
 * 任务管理器
 * 负责管理报告生成任务的状态、进度和生命周期
 */
export class TaskManager extends EventEmitter {
  private databaseService: DatabaseService
  private activeTasks: Map<string, TaskStatus> = new Map()
  private taskTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly TASK_TIMEOUT = 30 * 60 * 1000 // 30分钟超时

  constructor(databaseService: DatabaseService) {
    super()
    this.databaseService = databaseService
    logger.info('TaskManager initialized')
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      // 恢复未完成的任务
      await this.recoverActiveTasks()
      logger.info('TaskManager initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize TaskManager:', error)
      throw error
    }
  }

  /**
   * 创建新任务
   */
  async createTask(): Promise<string> {
    try {
      const taskId = uuidv4()
      const task: TaskStatus = {
        id: taskId,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 保存到数据库
      await this.databaseService.saveTaskStatus(task)

      // 添加到活跃任务列表
      this.activeTasks.set(taskId, task)

      // 设置超时处理
      this.setTaskTimeout(taskId)

      // 发送任务创建事件
      this.emit('taskCreated', task)

      logger.debug(`Task created: ${taskId}`)
      return taskId
    } catch (error) {
      logger.error(`Failed to create task:`, error)
      throw error
    }
  }

  /**
   * 更新任务状态
   */
  async updateTask(
    taskId: string,
    status: TaskStatus['status'],
    progress: number,
    message: string
  ): Promise<TaskStatus | null> {
    try {
      const existingTask = this.activeTasks.get(taskId)
      if (!existingTask) {
        logger.warn(`Task ${taskId} not found in active tasks`)
        return null
      }

      const updatedTask: TaskStatus = {
        ...existingTask,
        status,
        progress: Math.max(0, Math.min(100, progress)), // 确保进度在0-100之间
        errorMessage: message,
        updatedAt: new Date().toISOString()
      }

      // 保存到数据库
      await this.databaseService.saveTaskStatus(updatedTask)

      // 更新活跃任务列表
      this.activeTasks.set(taskId, updatedTask)

      // 发送任务更新事件
      this.emit('taskUpdated', updatedTask)

      // 发送任务进度事件（用于IPC转发）
      this.emit('task-progress', taskId, progress, message)

      // 如果任务完成或失败，清理资源
      if (status === 'completed' || status === 'failed') {
        // 异步清理任务，不阻塞当前操作
        this.cleanupTask(taskId).catch((error) => {
          logger.error(`Failed to cleanup task ${taskId}:`, error)
        })
      }

      logger.debug(`Task ${taskId} updated: ${status} (${progress}%) - ${message}`)
      return updatedTask
    } catch (error) {
      logger.error(`Failed to update task ${taskId}:`, error)
      throw error
    }
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: string): Promise<TaskStatus | null> {
    try {
      // 先从内存中查找
      const activeTask = this.activeTasks.get(taskId)
      if (activeTask) {
        return activeTask
      }

      // 从数据库中查找
      const task = await this.databaseService.getTaskStatus(taskId)
      return task
    } catch (error) {
      logger.error(`Failed to get task ${taskId}:`, error)
      throw error
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      const task = this.activeTasks.get(taskId)
      if (!task) {
        logger.warn(`Task ${taskId} not found or already completed`)
        return false
      }

      // 只能取消运行中或待处理的任务
      if (task.status !== 'running' && task.status !== 'pending') {
        logger.warn(`Task ${taskId} cannot be cancelled, current status: ${task.status}`)
        return false
      }

      // 更新任务状态为已取消
      await this.updateTask(taskId, 'failed', task.progress, '任务已被用户取消')

      // 发送任务取消事件
      this.emit('taskCancelled', task)

      logger.info(`Task ${taskId} cancelled successfully`)
      return true
    } catch (error) {
      logger.error(`Failed to cancel task ${taskId}:`, error)
      return false
    }
  }

  /**
   * 获取所有活跃任务
   */
  getActiveTasks(): TaskStatus[] {
    return Array.from(this.activeTasks.values())
  }

  /**
   * 获取任务统计信息
   */
  getTaskStats(): {
    active: number
    pending: number
    running: number
    completed: number
    failed: number
  } {
    const tasks = this.getActiveTasks()

    return {
      active: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length
    }
  }

  /**
   * 恢复活跃任务（从数据库）
   */
  private async recoverActiveTasks(): Promise<void> {
    try {
      // 这里可以实现从数据库恢复未完成任务的逻辑
      // 暂时跳过，因为任务通常是短期的
      logger.debug('Active tasks recovery completed')
    } catch (error) {
      logger.error('Failed to recover active tasks:', error)
    }
  }

  /**
   * 设置任务超时
   */
  private setTaskTimeout(taskId: string): void {
    // 清除现有超时
    const existingTimeout = this.taskTimeouts.get(taskId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // 设置新的超时
    const timeout = setTimeout(async () => {
      const task = this.activeTasks.get(taskId)
      if (task && (task.status === 'pending' || task.status === 'running')) {
        logger.warn(`Task ${taskId} timed out after ${this.TASK_TIMEOUT}ms`)
        await this.updateTask(taskId, 'failed', task.progress, '任务执行超时')
      }
    }, this.TASK_TIMEOUT)

    this.taskTimeouts.set(taskId, timeout)
  }

  /**
   * 清理任务资源
   */
  private async cleanupTask(taskId: string): Promise<void> {
    try {
      // 从活跃任务列表中移除
      this.activeTasks.delete(taskId)

      // 清除超时定时器
      const timeout = this.taskTimeouts.get(taskId)
      if (timeout) {
        clearTimeout(timeout)
        this.taskTimeouts.delete(taskId)
      }

      // 从数据库中删除任务记录
      try {
        await this.databaseService.deleteTask(taskId)
        logger.debug(`Task ${taskId} deleted from database`)
      } catch (dbError) {
        logger.warn(`Failed to delete task ${taskId} from database:`, dbError)
        // 继续清理，即使数据库删除失败
      }

      logger.debug(`Task ${taskId} resources cleaned up`)
    } catch (error) {
      logger.error(`Failed to cleanup task ${taskId}:`, error)
    }
  }

  /**
   * 清理所有任务
   */
  async cleanup(): Promise<void> {
    try {
      // 取消所有活跃任务
      const activeTasks = Array.from(this.activeTasks.keys())
      for (const taskId of activeTasks) {
        await this.cancelTask(taskId)
      }

      // 清除所有超时定时器
      for (const timeout of this.taskTimeouts.values()) {
        clearTimeout(timeout)
      }

      this.activeTasks.clear()
      this.taskTimeouts.clear()

      // 移除所有事件监听器
      this.removeAllListeners()

      logger.info('TaskManager cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup TaskManager:', error)
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ healthy: boolean; stats: any; error?: string }> {
    try {
      const stats = this.getTaskStats()

      return {
        healthy: true,
        stats
      }
    } catch (error) {
      logger.error('TaskManager health check failed:', error)
      return {
        healthy: false,
        stats: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
