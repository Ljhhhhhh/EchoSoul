/**
 * 联系人数据服务
 */
import type { Contact, ChatRoom } from '@types'

export class ContactService {
  /**
   * 获取好友联系人数据
   *
   * 数据结构：{userName, alias, remark, nickName, isFriend}
   * 转换为统一的 Contact 格式
   */
  static async fetchContacts(): Promise<Contact[]> {
    try {
      const contactsData = await window.api.chatlog.getContacts()
      return contactsData
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      throw new Error(error instanceof Error ? error.message : '获取好友失败')
    }
  }

  /**
   * 获取群聊数据
   *
   * 数据结构：{name, owner, remark, nickName, userCount}
   * 转换为统一的 Contact 格式
   */
  static async fetchChatRooms(): Promise<ChatRoom[]> {
    try {
      const chatRoomList = await window.api.chatlog.getChatroomList()
      return chatRoomList
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
      throw new Error(error instanceof Error ? error.message : '获取群聊失败')
    }
  }
}
