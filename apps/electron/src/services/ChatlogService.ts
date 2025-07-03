import { createLogger } from '../utils/logger';
import type { ChatMessage, Contact, ChatlogStatus } from '@echosoul/common';

const logger = createLogger('ChatlogService');

export class ChatlogService {
  private baseUrl = 'http://localhost:8080'; // chatlog默认端口

  async initialize() {
    logger.info('ChatlogService initialized');
  }

  async checkStatus(): Promise<ChatlogStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok ? 'running' : 'error';
    } catch (error) {
      logger.warn('Chatlog service not running:', error);
      return 'not-running';
    }
  }

  async startService(): Promise<boolean> {
    // TODO: 实现启动chatlog服务的逻辑
    logger.info('Attempting to start chatlog service');
    return false;
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contact`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.normalizeContacts(data);
    } catch (error) {
      logger.error('Failed to get contacts:', error);
      return [];
    }
  }

  async getMessages(params: {
    startDate: string;
    endDate: string;
    talker?: string;
  }): Promise<ChatMessage[]> {
    try {
      const url = new URL(`${this.baseUrl}/api/v1/chatlog`);
      url.searchParams.set('time', `${params.startDate}~${params.endDate}`);
      if (params.talker) {
        url.searchParams.set('talker', params.talker);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeMessages(data);
    } catch (error) {
      logger.error('Failed to get messages:', error);
      return [];
    }
  }

  private normalizeContacts(data: any[]): Contact[] {
    return data.map(item => ({
      id: item.id || item.wxid,
      name: item.name || item.nickname,
      type: item.type === 'chatroom' ? 'group' : 'individual',
      avatar: item.avatar,
      lastMessageTime: item.lastMessageTime,
    }));
  }

  private normalizeMessages(data: any[]): ChatMessage[] {
    return data.map(item => ({
      id: item.id || `${item.timestamp}-${item.sender}`,
      sender: item.sender || item.from,
      recipient: item.recipient || item.to,
      timestamp: item.timestamp,
      content: item.content || item.message,
      type: this.normalizeMessageType(item.type),
      isGroupChat: item.isGroupChat || false,
      groupName: item.groupName,
    }));
  }

  private normalizeMessageType(type: any): 'text' | 'image' | 'voice' | 'video' | 'file' {
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'image':
        case 'img':
          return 'image';
        case 'voice':
        case 'audio':
          return 'voice';
        case 'video':
          return 'video';
        case 'file':
          return 'file';
        default:
          return 'text';
      }
    }
    return 'text';
  }

  async cleanup() {
    logger.info('ChatlogService cleaned up');
  }
}
