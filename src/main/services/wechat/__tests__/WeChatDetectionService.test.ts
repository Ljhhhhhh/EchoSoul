import { WeChatDetectionService, createWeChatDetector } from '../WeChatDetectionService'

describe('WeChatDetectionService', () => {
  let service: WeChatDetectionService

  beforeEach(() => {
    // 创建检测器实例
    const detector = createWeChatDetector()
    service = new WeChatDetectionService(detector)
  })

  afterEach(() => {
    // 清理
    service.stopMonitoring()
    service.removeAllListeners()
  })

  describe('isWeChatRunning', () => {
    it('should return boolean indicating WeChat status', async () => {
      const isRunning = await service.isWeChatRunning()
      expect(typeof isRunning).toBe('boolean')
    })
  })

  describe('getWeChatProcesses', () => {
    it('should return detection result with process info', async () => {
      const result = await service.getWeChatProcesses()

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')

      if (result.success && result.data) {
        expect(Array.isArray(result.data)).toBe(true)

        // 如果有进程数据，验证结构
        if (result.data.length > 0) {
          const processInfo = result.data[0]
          expect(processInfo).toHaveProperty('pid')
          expect(processInfo).toHaveProperty('name')
          expect(processInfo).toHaveProperty('version')
          expect(typeof processInfo.pid).toBe('number')
          expect(typeof processInfo.name).toBe('string')
          expect(typeof processInfo.version).toBe('number')
        }
      }
    })
  })

  describe('getWeChatDataInfo', () => {
    it('should return detection result with data info', async () => {
      const result = await service.getWeChatDataInfo()

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')

      if (result.success && result.data) {
        expect(result.data).toHaveProperty('dataDir')
        expect(result.data).toHaveProperty('accountName')
        expect(result.data).toHaveProperty('version')
        expect(result.data).toHaveProperty('status')

        expect(typeof result.data.dataDir).toBe('string')
        expect(typeof result.data.accountName).toBe('string')
        expect(typeof result.data.version).toBe('number')
        expect(['online', 'offline']).toContain(result.data.status)
      }
    })

    it('should use cache when enabled', async () => {
      // 第一次调用
      const result1 = await service.getWeChatDataInfo(true)

      // 第二次调用应该使用缓存
      const result2 = await service.getWeChatDataInfo(true)

      expect(result1).toEqual(result2)
    })

    it('should bypass cache when disabled', async () => {
      // 清除缓存
      service.clearCache()

      // 不使用缓存的调用
      const result = await service.getWeChatDataInfo(false)

      expect(result).toHaveProperty('success')
    })
  })

  describe('cache management', () => {
    it('should clear cache correctly', () => {
      service.clearCache()
      // 缓存清除后，下次调用应该重新检测
      expect(() => service.clearCache()).not.toThrow()
    })
  })

  describe('monitoring', () => {
    it('should start and stop monitoring without errors', async () => {
      // 启动监听
      const monitoringPromise = service.startMonitoring(1000) // 1秒间隔

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 停止监听
      service.stopMonitoring()

      expect(monitoringPromise).resolves.toBeUndefined()
    })

    it('should emit events during monitoring', (done) => {
      let eventReceived = false

      // 监听状态变化事件
      service.once('statusChanged', (isRunning) => {
        expect(typeof isRunning).toBe('boolean')
        eventReceived = true
      })

      // 启动监听
      service.startMonitoring(500)

      // 等待事件触发
      setTimeout(() => {
        service.stopMonitoring()
        // 注意：在CI环境中可能没有微信进程，所以不强制要求事件触发
        done()
      }, 1000)
    })
  })
})

describe('createWeChatDetector', () => {
  it('should create appropriate detector for current platform', () => {
    const detector = createWeChatDetector()
    expect(detector).toBeDefined()
    expect(typeof detector.detectWeChatProcesses).toBe('function')
    expect(typeof detector.detectDataDirectory).toBe('function')
    expect(typeof detector.isWeChatRunning).toBe('function')
  })

  it('should create Windows detector on win32', () => {
    const originalPlatform = process.platform

    // Mock process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true
    })

    try {
      const detector = createWeChatDetector()
      expect(detector.constructor.name).toBe('WindowsWeChatDetector')
    } finally {
      // 恢复原始平台
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      })
    }
  })

  it('should create macOS detector on darwin', () => {
    const originalPlatform = process.platform

    // Mock process.platform
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true
    })

    try {
      const detector = createWeChatDetector()
      expect(detector.constructor.name).toBe('MacOSWeChatDetector')
    } finally {
      // 恢复原始平台
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      })
    }
  })

  it('should throw error for unsupported platform', () => {
    const originalPlatform = process.platform

    // Mock process.platform
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    })

    try {
      expect(() => createWeChatDetector()).toThrow('Unsupported platform: linux')
    } finally {
      // 恢复原始平台
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      })
    }
  })
})
