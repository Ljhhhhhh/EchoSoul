import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from './logger';

const logger = createLogger('HttpClient');

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        logger.debug(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      error => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      response => {
        logger.debug(
          `Response received: ${response.status} ${response.statusText}`
        );
        return response;
      },
      error => {
        if (error.response) {
          // 服务器响应了错误状态码
          logger.error(
            `HTTP Error ${error.response.status}: ${error.response.statusText}`
          );
          logger.debug('Error response data:', error.response.data);
        } else if (error.request) {
          // 请求已发出但没有收到响应
          if (error.code === 'ECONNREFUSED') {
            logger.debug(
              'Connection refused - service may not be running:',
              error.message
            );
          } else {
            logger.error('No response received:', error.message);
          }
        } else {
          // 其他错误
          logger.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用请求方法，支持重试机制
   */
  private async request<T = any>(
    config: RequestOptions,
    retries: number = 0
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.request<T>(config);
    } catch (error: any) {
      const maxRetries = config.retries || 0;
      const retryDelay = config.retryDelay || 1000;

      if (retries < maxRetries && this.shouldRetry(error)) {
        logger.warn(
          `Request failed, retrying in ${retryDelay}ms... (${retries + 1}/${maxRetries})`
        );
        await this.delay(retryDelay);
        return this.request<T>(config, retries + 1);
      }

      throw error;
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 对于连接拒绝错误，不进行重试（服务未运行）
    if (error.code === 'ECONNREFUSED') {
      return false;
    }

    // 网络超时或服务器错误（5xx）时重试
    return (
      !error.response ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET' ||
      (error.response &&
        error.response.status >= 500 &&
        error.response.status < 600)
    );
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.request<T>({
      method: 'GET',
      url,
      ...options,
    });
    return response.data;
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
    return response.data;
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
    return response.data;
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.request<T>({
      method: 'DELETE',
      url,
      ...options,
    });
    return response.data;
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...options,
    });
    return response.data;
  }

  /**
   * 健康检查
   */
  async healthCheck(endpoint: string = '/health'): Promise<boolean> {
    try {
      await this.get(endpoint, { timeout: 3000 });
      return true;
    } catch (error) {
      logger.debug('Health check failed:', error);
      return false;
    }
  }

  /**
   * 更新基础URL
   */
  updateBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
    logger.info(`Base URL updated to: ${baseURL}`);
  }

  /**
   * 获取当前基础URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}
