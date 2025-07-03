import * as winston from 'winston';
import * as path from 'path';
import { app } from 'electron';

// 创建日志目录
const logDir = path.join(app.getPath('userData'), 'logs');

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, stack }) => {
    const servicePrefix = service ? `[${service}] ` : '';
    const logMessage = `${timestamp} ${level.toUpperCase()} ${servicePrefix}${message}`;
    return stack ? `${logMessage}\n${stack}` : logMessage;
  })
);

// 创建主logger
const mainLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // 文件输出
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// 创建带服务名称的logger
export function createLogger(service: string): winston.Logger {
  return mainLogger.child({ service });
}

// 导出主logger
export { mainLogger as logger };
