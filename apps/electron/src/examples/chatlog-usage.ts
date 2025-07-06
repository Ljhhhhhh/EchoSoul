/**
 * Chatlog HTTP 客户端使用示例
 * 
 * 这个文件展示了如何使用新的基于 axios 的 HTTP 客户端
 * 来与 chatlog 服务进行交互
 */

import { ChatlogService } from '../services/ChatlogService';
import { ChatlogHttpClient } from '../services/ChatlogHttpClient';
import { createLogger } from '../utils/logger';

const logger = createLogger('ChatlogUsageExample');

/**
 * 示例 1: 使用 ChatlogService (推荐方式)
 * ChatlogService 提供了完整的 chatlog 管理功能，包括进程管理和 API 调用
 */
async function exampleUsingChatlogService() {
  logger.info('=== 使用 ChatlogService 示例 ===');

  const chatlogService = new ChatlogService();

  try {
    // 1. 初始化服务
    await chatlogService.initialize();
    logger.info('ChatlogService 初始化成功');

    // 2. 检查服务状态
    const status = await chatlogService.checkStatus();
    logger.info(`服务状态: ${status}`);

    if (status !== 'running') {
      // 3. 如果服务未运行，尝试启动
      logger.info('服务未运行，尝试启动...');
      const started = await chatlogService.startService();
      if (!started) {
        logger.error('服务启动失败');
        return;
      }
      logger.info('服务启动成功');
    }

    // 4. 获取联系人列表
    const contacts = await chatlogService.getContacts();
    logger.info(`获取到 ${contacts.length} 个联系人`);
    
    // 显示前 5 个联系人
    contacts.slice(0, 5).forEach(contact => {
      logger.info(`联系人: ${contact.name} (${contact.type}) - ID: ${contact.id}`);
    });

    // 5. 获取最近一周的消息
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const messages = await chatlogService.getMessages({
      startDate: oneWeekAgo.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });
    
    logger.info(`获取到 ${messages.length} 条消息`);

    // 6. 获取特定联系人的消息
    if (contacts.length > 0) {
      const firstContact = contacts[0];
      const contactMessages = await chatlogService.getMessages({
        startDate: oneWeekAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        talker: firstContact.id,
      });
      
      logger.info(`与 ${firstContact.name} 的消息数量: ${contactMessages.length}`);
    }

    // 7. 获取群聊信息
    const groupContacts = contacts.filter(c => c.type === 'group');
    if (groupContacts.length > 0) {
      const groupInfo = await chatlogService.getChatroomInfo(groupContacts[0].id);
      if (groupInfo) {
        logger.info(`群聊信息: ${groupInfo.name}, 成员数: ${groupInfo.memberCount}`);
      }
    }

    // 8. 获取会话列表
    const sessions = await chatlogService.getSessions();
    logger.info(`活跃会话数量: ${sessions.length}`);

  } catch (error) {
    logger.error('ChatlogService 使用过程中出错:', error);
  } finally {
    // 清理资源
    await chatlogService.cleanup();
  }
}

/**
 * 示例 2: 直接使用 ChatlogHttpClient
 * 当你只需要 API 调用功能，不需要进程管理时可以使用
 */
async function exampleUsingChatlogHttpClient() {
  logger.info('=== 使用 ChatlogHttpClient 示例 ===');

  const httpClient = new ChatlogHttpClient('http://127.0.0.1:5030');

  try {
    // 1. 检查服务状态
    const isRunning = await httpClient.checkServiceStatus();
    if (!isRunning) {
      logger.warn('Chatlog 服务未运行，请先启动服务');
      return;
    }

    // 2. 获取个人联系人
    const individualContacts = await httpClient.getContacts({
      type: 'individual',
      limit: 10,
    });
    logger.info(`个人联系人数量: ${individualContacts.length}`);

    // 3. 获取群聊联系人
    const groupContacts = await httpClient.getContacts({
      type: 'group',
      limit: 5,
    });
    logger.info(`群聊数量: ${groupContacts.length}`);

    // 4. 分页获取消息
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const recentMessages = await httpClient.getMessages({
      startDate: yesterdayStr,
      endDate: today,
      limit: 50,
      offset: 0,
    });
    logger.info(`最近消息数量: ${recentMessages.length}`);

    // 5. 获取特定群聊的详细信息
    for (const group of groupContacts.slice(0, 2)) {
      const groupInfo = await httpClient.getChatroomInfo(group.id);
      if (groupInfo) {
        logger.info(`群聊 "${groupInfo.name}" 有 ${groupInfo.memberCount} 个成员`);
      }
    }

    // 6. 获取会话列表
    const sessions = await httpClient.getSessions();
    logger.info(`会话列表获取成功，共 ${sessions.length} 个会话`);

    // 显示最活跃的会话
    const sortedSessions = sessions
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
      .slice(0, 5);

    logger.info('最近活跃的会话:');
    sortedSessions.forEach((session, index) => {
      const lastMessageDate = new Date(session.lastMessageTime * 1000);
      logger.info(`${index + 1}. ${session.talker} - 最后消息: ${lastMessageDate.toLocaleString()}`);
    });

  } catch (error) {
    logger.error('ChatlogHttpClient 使用过程中出错:', error);
  }
}

/**
 * 示例 3: 错误处理和重试机制
 */
async function exampleErrorHandling() {
  logger.info('=== 错误处理示例 ===');

  const httpClient = new ChatlogHttpClient('http://127.0.0.1:5030');

  try {
    // 尝试连接到可能不存在的服务
    const isRunning = await httpClient.checkServiceStatus();
    
    if (!isRunning) {
      logger.warn('服务未运行，演示错误处理');
      
      // 尝试获取数据，这会触发错误
      try {
        await httpClient.getContacts();
      } catch (error) {
        logger.error('预期的错误:', error.message);
      }
    }

    // 演示更新服务地址
    logger.info('更新服务地址...');
    httpClient.updateBaseUrl('http://127.0.0.1:5031');
    
    // 尝试连接新地址（可能失败）
    const newStatus = await httpClient.checkServiceStatus();
    logger.info(`新地址服务状态: ${newStatus}`);

  } catch (error) {
    logger.error('错误处理示例中的错误:', error);
  }
}

/**
 * 主函数 - 运行所有示例
 */
async function main() {
  logger.info('开始 Chatlog HTTP 客户端使用示例');

  // 运行示例 1
  await exampleUsingChatlogService();
  
  // 等待一秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 运行示例 2
  await exampleUsingChatlogHttpClient();
  
  // 等待一秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 运行示例 3
  await exampleErrorHandling();

  logger.info('所有示例运行完成');
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main().catch(error => {
    logger.error('示例运行失败:', error);
    process.exit(1);
  });
}

export {
  exampleUsingChatlogService,
  exampleUsingChatlogHttpClient,
  exampleErrorHandling,
};
