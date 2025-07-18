import { WeChatDatabaseService, getWeChatDatabaseService } from '../WeChatDatabaseService'
import * as fs from 'fs'
import { spawn } from 'child_process'

// Mock dependencies
jest.mock('fs')
jest.mock('child_process')

const mockFs = fs as jest.Mocked<typeof fs>
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>

describe('WeChatDatabaseService', () => {
  let service: WeChatDatabaseService

  beforeEach(() => {
    service = new WeChatDatabaseService()
    jest.clearAllMocks()
  })

  afterEach(() => {
    service.cleanup()
  })

  describe('checkDecryptedData', () => {
    it('should return false if work directory does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const result = await service.checkDecryptedData('/nonexistent/path')

      expect(result).toBe(false)
    })

    it('should return true if database files exist', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'session.db', isDirectory: () => false },
        { name: 'msg_0.db', isDirectory: () => false }
      ] as any)

      const result = await service.checkDecryptedData('/valid/path')

      expect(result).toBe(true)
    })

    it('should return false if no database files exist', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([{ name: 'other.txt', isDirectory: () => false }] as any)

      const result = await service.checkDecryptedData('/valid/path')

      expect(result).toBe(false)
    })
  })

  describe('validateDatabaseIntegrity', () => {
    it('should return error if no database files found', async () => {
      mockFs.readdirSync.mockReturnValue([])

      const result = await service.validateDatabaseIntegrity('/empty/path')

      expect(result.success).toBe(false)
      expect(result.error).toContain('No database files found')
    })

    it('should validate database files successfully', async () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'session.db', isDirectory: () => false },
        { name: 'msg_0.db', isDirectory: () => false },
        { name: 'contact.db', isDirectory: () => false }
      ] as any)

      mockFs.statSync.mockReturnValue({ size: 1024 } as any)

      const result = await service.validateDatabaseIntegrity('/valid/path')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(result.message).toContain('Found 3 valid database files')
    })

    it('should return error if database file is empty', async () => {
      mockFs.readdirSync.mockReturnValue([{ name: 'session.db', isDirectory: () => false }] as any)

      mockFs.statSync.mockReturnValue({ size: 0 } as any)

      const result = await service.validateDatabaseIntegrity('/valid/path')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database file is empty')
    })
  })

  describe('decryptDatabase', () => {
    const validParams = {
      sourceDir: '/source',
      workDir: '/work',
      key: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      chatlogPath: '/path/to/chatlog'
    }

    it('should return error if source directory does not exist', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path !== '/source'
      })

      const result = await service.decryptDatabase(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Source directory not found')
    })

    it('should return error if key is empty', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const result = await service.decryptDatabase({
        ...validParams,
        key: ''
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Decryption key is required')
    })

    it('should return error if chatlog executable not found', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path !== '/path/to/chatlog'
      })

      const result = await service.decryptDatabase(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Chatlog executable not found')
    })

    it('should successfully decrypt database', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.mkdirSync.mockImplementation(() => {})

      // Mock successful process
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from('Processing...')), 10)
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

      const result = await service.decryptDatabase(validParams)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Database decryption completed successfully')
      expect(mockSpawn).toHaveBeenCalledWith(
        '/path/to/chatlog',
        ['decrypt', '--data-dir', '/source', '--work-dir', '/work', '--key', validParams.key],
        { stdio: ['pipe', 'pipe', 'pipe'] }
      )
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
              setTimeout(() => callback(Buffer.from('Decryption failed')), 10)
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

      const result = await service.decryptDatabase(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Decryption failed')
    })

    it('should emit progress events', async () => {
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
              setTimeout(() => callback(Buffer.from('Processing database...')), 10)
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

      await service.decryptDatabase(validParams)

      expect(progressEvents.length).toBeGreaterThan(0)
      expect(progressEvents.some((e) => e.step === 'decrypting')).toBe(true)
    })
  })

  describe('cancelDecryption', () => {
    it('should cancel active process', () => {
      const mockProcess = {
        kill: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      }

      // Simulate active process
      service['activeDecryptionProcess'] = mockProcess as any

      service.cancelDecryption()

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM')
      expect(service['activeDecryptionProcess']).toBeNull()
    })

    it('should handle no active process gracefully', () => {
      expect(() => service.cancelDecryption()).not.toThrow()
    })
  })
})

describe('getWeChatDatabaseService', () => {
  it('should return singleton instance', () => {
    const service1 = getWeChatDatabaseService()
    const service2 = getWeChatDatabaseService()

    expect(service1).toBe(service2)
    expect(service1).toBeInstanceOf(WeChatDatabaseService)
  })
})
