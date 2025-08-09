/**
 * 错误处理工具类
 */

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  DATA_ERROR = 'DATA_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  originalError?: Error
  context?: Record<string, unknown>
}

export class ErrorHandler {
  /**
   * 创建应用错误
   */
  static createError(
    code: ErrorCode,
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): AppError {
    return {
      code,
      message,
      originalError,
      context
    }
  }

  /**
   * 处理API错误
   */
  static handleApiError(error: unknown, context?: Record<string, unknown>): AppError {
    if (error instanceof Error) {
      // 网络错误
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return this.createError(ErrorCode.NETWORK_ERROR, '网络连接失败，请检查网络', error, context)
      }

      // 权限错误
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return this.createError(ErrorCode.PERMISSION_ERROR, '没有权限访问此数据', error, context)
      }

      return this.createError(ErrorCode.DATA_ERROR, error.message, error, context)
    }

    return this.createError(ErrorCode.UNKNOWN_ERROR, '未知错误', undefined, context)
  }

  /**
   * 记录错误日志
   */
  static logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      originalError: error.originalError,
      context: error.context,
      timestamp: new Date().toISOString()
    })

    // 这里可以集成错误监控服务，如 Sentry
    // Sentry.captureException(error.originalError || new Error(error.message))
  }
}
