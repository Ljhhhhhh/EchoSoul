/**
 * 测试工具和Mock数据
 */
import type { Contact, PromptTemplate, SavedCondition } from '../types'

// Mock 联系人数据
export const mockPersonalContacts: Contact[] = [
  {
    id: 'user1',
    userName: 'user1',
    nickName: '张三',
    alias: '老张',
    remark: '同事',
    isFriend: true,
    type: 'individual'
  },
  {
    id: 'user2',
    userName: 'user2',
    nickName: '李四',
    alias: '',
    remark: '朋友',
    isFriend: true,
    type: 'individual'
  }
]

export const mockGroupChats: Contact[] = [
  {
    id: 'group1',
    name: 'group1',
    nickName: '工作群',
    remark: '项目讨论',
    type: 'group',
    users: [
      { userName: 'user1', displayName: '张三' },
      { userName: 'user2', displayName: '李四' },
      { userName: 'user3', displayName: '王五' }
    ],
    memberCount: 3
  }
]

// Mock Prompt 数据
export const mockPrompts: PromptTemplate[] = [
  {
    id: '1',
    name: '情感分析专家',
    content: '分析聊天记录中的情感变化趋势...',
    isBuiltIn: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: '关系洞察师',
    content: '深度分析聊天双方的关系模式...',
    isBuiltIn: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

// Mock 保存条件数据
export const mockSavedConditions: SavedCondition[] = [
  {
    id: '1',
    name: '最近一周 · 工作群 · 情感分析专家',
    timeRange: 'last_week',
    customStartDate: '',
    customEndDate: '',
    targetType: 'specific',
    selectedContacts: ['group1'],
    analysisType: '1',
    customPrompt: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    usageCount: 3
  }
]

// Mock API 响应
export const mockApiResponses = {
  contacts: {
    success: mockPersonalContacts,
    error: new Error('Failed to fetch contacts')
  },
  chatrooms: {
    success: mockGroupChats,
    error: new Error('Failed to fetch chatrooms')
  }
}

// 测试工具函数
export const testUtils = {
  /**
   * 创建Mock的window.api对象
   */
  createMockApi: (shouldFail = false) => ({
    chatlog: {
      getContacts: jest
        .fn()
        .mockImplementation(() =>
          shouldFail
            ? Promise.reject(mockApiResponses.contacts.error)
            : Promise.resolve(mockApiResponses.contacts.success)
        ),
      getChatroomList: jest
        .fn()
        .mockImplementation(() =>
          shouldFail
            ? Promise.reject(mockApiResponses.chatrooms.error)
            : Promise.resolve(mockApiResponses.chatrooms.success)
        )
    }
  }),

  /**
   * 创建测试用的localStorage Mock
   */
  createMockStorage: () => {
    const storage: Record<string, string> = {}
    return {
      getItem: jest.fn((key: string) => storage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key]
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key])
      })
    }
  },

  /**
   * 等待React Hook更新
   */
  waitForNextUpdate: () => new Promise((resolve) => setTimeout(resolve, 0)),

  /**
   * 模拟用户输入事件
   */
  createChangeEvent: (value: string) => ({
    target: { value },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }),

  /**
   * 模拟表单提交事件
   */
  createSubmitEvent: () => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  })
}

// 常用的测试断言辅助函数
export const assertions = {
  /**
   * 验证组件是否正确渲染
   */
  expectComponentToRender: (component: any) => {
    expect(component).toBeInTheDocument()
  },

  /**
   * 验证Hook状态
   */
  expectHookState: (result: any, expectedState: any) => {
    expect(result.current).toMatchObject(expectedState)
  },

  /**
   * 验证函数被调用
   */
  expectFunctionCalled: (fn: jest.Mock, times = 1) => {
    expect(fn).toHaveBeenCalledTimes(times)
  },

  /**
   * 验证错误状态
   */
  expectErrorState: (result: any, errorMessage: string) => {
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isLoading).toBe(false)
  }
}
