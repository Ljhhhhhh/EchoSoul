/**
 * 联系人数据服务
 */
import type { Contact } from '../types'

export class ContactService {
  /**
   * 获取好友联系人数据
   *
   * 数据结构：{userName, alias, remark, nickName, isFriend}
   * 转换为统一的 Contact 格式
   */
  static async fetchContacts(): Promise<Contact[]> {
    try {
      const result = await window.api.chatlog.getContacts()
      console.log('获取到的原始好友数据:', result)

      const contactsData = (result || []).map((contact: any) => ({
        id: contact.userName, // 使用 userName 作为唯一标识
        userName: contact.userName,
        nickName: contact.nickName || contact.userName,
        alias: contact.alias || '',
        remark: contact.remark || '',
        isFriend: contact.isFriend,
        type: 'individual' as const
      }))

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
  static async fetchChatRooms(): Promise<Contact[]> {
    try {
      const chatRoomList = await window.api.chatlog.getChatroomList()
      console.log('获取到的原始群聊数据:', chatRoomList)

      const groupChatsData = (chatRoomList || []).map((chatRoom: any) => ({
        id: chatRoom.name, // 使用 name 作为唯一标识
        name: chatRoom.name,
        nickName: chatRoom.nickName || chatRoom.name,
        remark: chatRoom.remark || '',
        owner: chatRoom.owner,
        memberCount: chatRoom.userCount || 0,
        type: 'group' as const
      }))

      return groupChatsData
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
      throw new Error(error instanceof Error ? error.message : '获取群聊失败')
    }
  }

  /**
   * 获取所有联系人数据（好友 + 群聊）
   */
  static async fetchAllContacts(): Promise<{
    allContacts: Contact[]
    personalContacts: Contact[]
    groupChats: Contact[]
  }> {
    try {
      const [personalContacts, groupChats] = await Promise.all([
        this.fetchContacts(),
        this.fetchChatRooms()
      ])

      const allContacts = [...personalContacts, ...groupChats]

      return {
        allContacts,
        personalContacts,
        groupChats
      }
    } catch (error) {
      console.error('Failed to fetch all contacts:', error)
      throw new Error(error instanceof Error ? error.message : '获取联系人数据失败')
    }
  }

  /**
   * 分离个人联系人和群聊（已废弃，现在直接从不同接口获取）
   * @deprecated 使用 fetchAllContacts() 替代
   */
  static separateContacts(contacts: Contact[]) {
    const personalContacts = contacts.filter((contact) => contact.type === 'individual')
    const groupChats = contacts.filter((contact) => contact.type === 'group')
    return { personalContacts, groupChats }
  }

  /**
   * 预处理搜索数据
   */
  static prepareSearchableContacts(contacts: Contact[]) {
    return contacts.map((contact) => ({
      ...contact,
      searchFields: {
        nickName: (contact.nickName || '').toLowerCase(),
        alias: (contact.alias || '').toLowerCase(),
        remark: (contact.remark || '').toLowerCase(),
        userName: (contact.userName || '').toLowerCase(),
        name: (contact.name || '').toLowerCase(), // 添加对群聊 name 字段的搜索支持
        groupMembers:
          contact.type === 'group' && contact.users
            ? contact.users.map((user) => ({
                userName: (user.userName || '').toLowerCase(),
                displayName: (user.displayName || '').toLowerCase()
              }))
            : []
      }
    }))
  }

  /**
   * 搜索联系人
   * 注意：现在传入的 searchableContacts 应该是单一类型的联系人（好友或群聊）
   */
  static searchContacts(searchableContacts: any[], searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return searchableContacts
    }

    const term = searchTerm.toLowerCase().trim()

    return searchableContacts.filter((contact) => {
      const { nickName, alias, remark, userName, name, groupMembers } = contact.searchFields

      // 由于传入的数据已经是单一类型，直接按类型进行搜索
      if (contact.type === 'individual') {
        // 好友：优先按 remark 搜索，然后是 nickName、alias、userName
        return (
          remark.includes(term) ||
          nickName.includes(term) ||
          alias.includes(term) ||
          userName.includes(term)
        )
      } else {
        // 群聊：优先按 nickName 搜索，然后是 name、remark
        if (nickName.includes(term) || name.includes(term) || remark.includes(term)) {
          return true
        }

        // 搜索群聊成员
        if (groupMembers.length > 0) {
          return groupMembers.some(
            (member: any) => member.userName.includes(term) || member.displayName.includes(term)
          )
        }
      }

      return false
    })
  }

  /**
   * 搜索好友联系人
   */
  static searchPersonalContacts(searchableContacts: any[], searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return searchableContacts
    }

    const term = searchTerm.toLowerCase().trim()

    return searchableContacts.filter((contact) => {
      const { nickName, alias, remark, userName } = contact.searchFields
      // 好友：优先按 remark 搜索，然后是 nickName、alias、userName
      return (
        remark.includes(term) ||
        nickName.includes(term) ||
        alias.includes(term) ||
        userName.includes(term)
      )
    })
  }

  /**
   * 搜索群聊
   */
  static searchGroupChats(searchableContacts: any[], searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return searchableContacts
    }

    const term = searchTerm.toLowerCase().trim()

    return searchableContacts.filter((contact) => {
      const { nickName, name, remark, groupMembers } = contact.searchFields

      // 群聊：优先按 nickName 搜索，然后是 name、remark
      if (nickName.includes(term) || name.includes(term) || remark.includes(term)) {
        return true
      }

      // 搜索群聊成员
      if (groupMembers.length > 0) {
        return groupMembers.some(
          (member: any) => member.userName.includes(term) || member.displayName.includes(term)
        )
      }

      return false
    })
  }
}
