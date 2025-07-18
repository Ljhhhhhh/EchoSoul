import { WeChatKeyService, getWeChatKeyService, validateWeChatKey } from '../WeChatKeyService'
import * as fs from 'fs'
import { spawn } from 'child_process'

// Mock dependencies
jest.mock('fs')
jest.mock('child_process')

const mockFs = fs as jest.Mocked<typeof fs>
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>

describe('WeChatKeyService', () => {
  let service: WeChatKeyService

  beforeEach(() => {
    service = new WeChatKeyService()
    jest.clearAllMocks()
  })

  afterEach(() => {
    service.cleanup()
  })

  describe('validateKey', () => {
    it('should validate correct 64-character hex key', () => {
      const validKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      expect(service.validateKey(validKey)).toBe(true)
    })

    it('should reject invalid key formats', () => {
      expect(service.validateKey('')).toBe(false)
      expect(service.validateKey('short')).toBe(false)
      expect(
        service.validateKey('g1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456')
      ).toBe(false) // contains 'g'
      expect(
        service.validateKey('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345')
      ).toBe(false) // 63 chars
      expect(
        service.validateKey('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567')
      ).toBe(false) // 65 chars
    })

    it('should handle null and undefined', () => {
      expect(service.validateKey(null as any)).toBe(false)
      expect(service.validateKey(undefined as any)).toBe(false)
    })
  })

  describe('getWeChatKey', () => {
    it('should return error if chatlog path does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const result = await service.getWeChatKey('/nonexistent/path')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should successfully extract valid key', async () => {
      const validKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'

      mockFs.existsSync.mockReturnValue(true)

      // Mock successful process
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from(validKey)), 10)
            }
          })
        },
        stderr: {
          on: jest.fn()
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 20) // success exit code
          }
        }),
        kill: jest.fn()
      }

      mockSpawn.mockReturnValue(mockProcess as any)

      const result = await service.getWeChatKey('/valid/chatlog/path')

      expect(result.success).toBe(true)
      expect(result.key).toBe(validKey)
      expect(mockSpawn).toHaveBeenCalledWith('/valid/chatlog/path', ['key'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
    })

    it('should handle process failure', async () => {
      mockFs.existsSync.mockReturnValue(true)

      // Mock failed process
      const mockProcess = {
        stdout: {
          on: jest.fn()
        },
        stderr: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from('Error message')), 10)
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 20) // failure exit code
          }
        }),
        kill: jest.fn()
      }

      mockSpawn.mockReturnValue(mockProcess as any)

      const result = await service.getWeChatKey('/valid/chatlog/path')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error message')
    })

    it('should handle invalid key format from process', async () => {
      const invalidKey = 'invalid_key_format'

      mockFs.existsSync.mockReturnValue(true)

      // Mock process returning invalid key
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from(invalidKey)), 10)
            }
          })
        },
        stderr: {
          on: jest.fn()
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 20) // success exit code but invalid key
          }
        }),
        kill: jest.fn()
      }

      mockSpawn.mockReturnValue(mockProcess as any)

      const result = await service.getWeChatKey('/valid/chatlog/path')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid key format')
    })

    it('should emit progress events', async () => {
      const validKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'

      mockFs.existsSync.mockReturnValue(true)

      const progressEvents: any[] = []
      service.on('progress', (progress) => {
        progressEvents.push(progress)
      })

      // Mock successful process
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from(validKey)), 10)
            }
          })
        },
        stderr: {
          on: jest.fn()
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 20)
          }
        }),
        kill: jest.fn()
      }

      mockSpawn.mockReturnValue(mockProcess as any)

      await service.getWeChatKey('/valid/chatlog/path')

      expect(progressEvents.length).toBeGreaterThan(0)
      expect(progressEvents.some((e) => e.step === 'getting_key')).toBe(true)
    })
  })

  describe('cancelKeyExtraction', () => {
    it('should cancel active process', () => {
      const mockProcess = {
        kill: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      }

      // Simulate active process
      service['activeKeyProcess'] = mockProcess as any

      service.cancelKeyExtraction()

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM')
      expect(service['activeKeyProcess']).toBeNull()
    })

    it('should handle no active process gracefully', () => {
      expect(() => service.cancelKeyExtraction()).not.toThrow()
    })
  })

  describe('getPrerequisites', () => {
    it('should return prerequisites status', async () => {
      const result = await service.getPrerequisites()

      expect(result).toHaveProperty('wechatRunning')
      expect(result).toHaveProperty('hasPermissions')
      expect(result).toHaveProperty('chatlogAvailable')
      expect(result).toHaveProperty('message')

      expect(typeof result.wechatRunning).toBe('boolean')
      expect(typeof result.hasPermissions).toBe('boolean')
      expect(typeof result.chatlogAvailable).toBe('boolean')
      expect(typeof result.message).toBe('string')
    })
  })

  describe('checkWeChatKeyReadiness', () => {
    it('should return readiness status', async () => {
      const result = await service.checkWeChatKeyReadiness()

      expect(result).toHaveProperty('ready')
      expect(result).toHaveProperty('message')
      expect(typeof result.ready).toBe('boolean')
      expect(typeof result.message).toBe('string')
    })
  })
})

describe('getWeChatKeyService', () => {
  it('should return singleton instance', () => {
    const service1 = getWeChatKeyService()
    const service2 = getWeChatKeyService()

    expect(service1).toBe(service2)
    expect(service1).toBeInstanceOf(WeChatKeyService)
  })
})

describe('validateWeChatKey', () => {
  it('should validate key using service', () => {
    const validKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
    const invalidKey = 'invalid'

    expect(validateWeChatKey(validKey)).toBe(true)
    expect(validateWeChatKey(invalidKey)).toBe(false)
  })
})
