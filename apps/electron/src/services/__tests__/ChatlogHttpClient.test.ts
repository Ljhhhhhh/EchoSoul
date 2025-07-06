import { ChatlogHttpClient } from '../ChatlogHttpClient';
import { HttpClient } from '../../utils/HttpClient';

// Mock HttpClient
jest.mock('../../utils/HttpClient');
const MockedHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('ChatlogHttpClient', () => {
  let chatlogClient: ChatlogHttpClient;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock instance
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      healthCheck: jest.fn(),
      updateBaseURL: jest.fn(),
      getBaseURL: jest.fn(),
    } as any;

    // Mock HttpClient constructor
    MockedHttpClient.mockImplementation(() => mockHttpClient);

    // Create ChatlogHttpClient instance
    chatlogClient = new ChatlogHttpClient('http://test:5030');
  });

  describe('checkServiceStatus', () => {
    it('should return true when service is running', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await chatlogClient.checkServiceStatus();

      expect(result).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/contact', {
        timeout: 3000,
        retries: 1,
      });
    });

    it('should return false when service is not running', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Connection refused'));

      const result = await chatlogClient.checkServiceStatus();

      expect(result).toBe(false);
    });
  });

  describe('getContacts', () => {
    it('should return normalized contacts', async () => {
      const mockData = [
        {
          id: 'contact1',
          name: 'Contact 1',
          type: 'individual',
          avatar: 'avatar1.jpg',
          lastMessageTime: 1234567890,
        },
        {
          wxid: 'contact2',
          nickname: 'Contact 2',
          type: 'chatroom',
          avatar: 'avatar2.jpg',
        },
      ];

      mockHttpClient.get.mockResolvedValue(mockData);

      const result = await chatlogClient.getContacts();

      expect(result).toEqual([
        {
          id: 'contact1',
          name: 'Contact 1',
          type: 'individual',
          avatar: 'avatar1.jpg',
          lastMessageTime: 1234567890,
        },
        {
          id: 'contact2',
          name: 'Contact 2',
          type: 'group',
          avatar: 'avatar2.jpg',
          lastMessageTime: undefined,
        },
      ]);
    });

    it('should handle API errors', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'));

      await expect(chatlogClient.getContacts()).rejects.toThrow('获取联系人失败');
    });
  });

  describe('getMessages', () => {
    it('should return normalized messages', async () => {
      const mockData = [
        {
          id: 'msg1',
          sender: 'user1',
          recipient: 'user2',
          timestamp: 1234567890,
          content: 'Hello',
          type: 'text',
        },
        {
          from: 'user2',
          to: 'user1',
          timestamp: 1234567891,
          message: 'Hi',
          type: 'image',
        },
      ];

      mockHttpClient.get.mockResolvedValue(mockData);

      const result = await chatlogClient.getMessages({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual([
        {
          id: 'msg1',
          sender: 'user1',
          recipient: 'user2',
          timestamp: 1234567890,
          content: 'Hello',
          type: 'text',
          isGroupChat: false,
          groupName: undefined,
        },
        {
          id: '1234567891-user2',
          sender: 'user2',
          recipient: 'user1',
          timestamp: 1234567891,
          content: 'Hi',
          type: 'image',
          isGroupChat: false,
          groupName: undefined,
        },
      ]);
    });

    it('should build correct query parameters', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      await chatlogClient.getMessages({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        talker: 'user1',
        limit: 100,
        offset: 50,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/chatlog?time=2024-01-01~2024-01-31&talker=user1&limit=100&offset=50',
        {
          retries: 3,
          retryDelay: 1000,
        }
      );
    });
  });

  describe('getChatroomInfo', () => {
    it('should return chatroom info', async () => {
      const mockData = {
        id: 'chatroom1',
        name: 'Test Group',
        memberCount: 5,
        members: ['user1', 'user2', 'user3'],
        avatar: 'group.jpg',
        createTime: 1234567890,
      };

      mockHttpClient.get.mockResolvedValue(mockData);

      const result = await chatlogClient.getChatroomInfo('chatroom1');

      expect(result).toEqual(mockData);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/chatroom/chatroom1', {
        retries: 3,
        retryDelay: 1000,
      });
    });

    it('should return null on error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'));

      const result = await chatlogClient.getChatroomInfo('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateBaseUrl', () => {
    it('should update base URL', () => {
      const newUrl = 'http://new-host:5030';

      chatlogClient.updateBaseUrl(newUrl);

      expect(mockHttpClient.updateBaseURL).toHaveBeenCalledWith(newUrl);
    });
  });
});
