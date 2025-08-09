/**
 * 联系人相关类型定义
 */

export interface Contact {
  id: string // 唯一标识符，个人联系人使用userName，群聊使用name
  userName?: string // 个人联系人的用户名
  name?: string // 群聊的名称标识
  nickName: string // 显示名称
  alias?: string // 别名
  remark?: string // 备注
  isFriend?: boolean // 是否为好友（仅个人联系人）
  type: 'individual' | 'group' // 联系人类型
  users?: Array<{ userName: string; displayName: string }> // 群聊成员（仅群聊）
  memberCount?: number // 成员数量（仅群聊）
}

export interface ContactSearchable extends Contact {
  searchFields: {
    nickName: string
    alias: string
    remark: string
    groupMembers: Array<{
      userName: string
      displayName: string
    }>
  }
}

export interface ContactsState {
  contacts: Contact[]
  personalContacts: Contact[]
  groupChats: Contact[]
  isLoading: boolean
  error: string | null
}

export interface ContactSearchState {
  searchTerm: string
  filteredContacts: ContactSearchable[]
  isPopoverOpen: boolean
}
