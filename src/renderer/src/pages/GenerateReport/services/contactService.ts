/**
 * 联系人数据服务
 */
import type { Contact } from '../types'

export class ContactService {
  /**
   * 获取联系人数据
   *
   * 重要变更：
   * - 现在只调用 getContacts() 接口，该接口已包含群聊和好友数据
   * - 通过 userName 是否以 '@chatroom' 结尾来区分群聊和好友
   * - 群聊显示名称使用 nickName，好友显示名称优先使用 remark
   * - 统一使用 userName 作为唯一标识符
   */
  static async fetchContacts(): Promise<Contact[]> {
    try {
      const contactsData = await window.api.chatlog.getContacts()

      console.log('获取到的联系人数据:', contactsData)

      if (!Array.isArray(contactsData)) {
        return []
      }

      const allContacts: Contact[] = contactsData
        .filter((contact) => contact.userName && contact.userName.trim() !== '')
        .map((contact) => {
          // 根据 userName 是否以 '@chatroom' 结尾判断是否为群聊
          const isGroup = contact.userName.endsWith('@chatroom')

          if (isGroup) {
            // 群聊处理：显示名称使用 nickName
            return {
              id: contact.userName, // 统一使用 userName 作为 ID
              userName: contact.userName,
              name: contact.userName, // 群聊的 name 字段
              nickName: contact.nickName || contact.userName, // 群聊显示名称
              remark: contact.remark,
              type: 'group' as const,
              memberCount: contact.users ? contact.users.length : 0
            }
          } else {
            // 个人联系人处理：显示名称优先使用 remark
            return {
              id: contact.userName, // 统一使用 userName 作为 ID
              userName: contact.userName,
              // 好友的显示名称：remark > nickName > userName
              nickName: contact.remark,
              alias: contact.alias,
              remark: contact.remark,
              isFriend: contact.isFriend,
              type: 'individual' as const
            }
          }
        })
        .filter((contact) => {
          // 过滤掉群成员数量为0的群聊
          if (contact.type === 'group') {
            return true // contact.memberCount > 0
          }
          // 过滤掉没有显示名称的个人联系人
          if (contact.type === 'individual') {
            return contact.nickName && contact.nickName.trim() !== ''
          }
          return true
        })

      return allContacts
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      throw new Error(error instanceof Error ? error.message : '获取联系人失败')
    }
  }

  /**
   * 分离个人联系人和群聊
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
   */
  static searchContacts(searchableContacts: any[], searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return searchableContacts
    }

    const term = searchTerm.toLowerCase().trim()

    return searchableContacts.filter((contact) => {
      const { nickName, alias, remark, userName, groupMembers } = contact.searchFields

      // 搜索显示名称、别名、备注、用户名
      if (
        nickName.includes(term) ||
        alias.includes(term) ||
        remark.includes(term) ||
        userName.includes(term)
      ) {
        return true
      }

      // 搜索群聊成员
      if (contact.type === 'group' && groupMembers.length > 0) {
        const memberMatch = groupMembers.some(
          (member: any) => member.userName.includes(term) || member.displayName.includes(term)
        )
        if (memberMatch) {
          return true
        }
      }

      return false
    })
  }
}
