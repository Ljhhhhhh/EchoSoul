/**
 * 联系人相关类型定义
 */

export interface Contact {
  userName: string
  alias: string
  remark: string
  nickName: string
  isFriend?: boolean
}

export interface ChatRoom {
  name: string
  remark: string
  nickName: string
  users: any[]
}
