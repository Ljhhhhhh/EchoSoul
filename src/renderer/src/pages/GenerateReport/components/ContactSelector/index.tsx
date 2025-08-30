/**
 * 联系人选择组件 - 完整实现
 */
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, X, UserCheck, Users as GroupIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup
} from '@renderer/components/ui/command'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import type { Contact, ChatRoom } from '@types'

interface ContactSelectorProps {
  // 数据
  personalContacts: Contact[]
  chatRooms: ChatRoom[]
  // 更新选中的联系人
  initSelectedContacts: string
  onSelectedContactsUpdate: (contacts: string, contactName: string) => void
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  personalContacts,
  chatRooms,
  initSelectedContacts,
  onSelectedContactsUpdate
}) => {
  // 状态管理
  const [targetType, setTargetType] = useState<'personal' | 'chatroom'>('personal')
  const [searchTerm, setSearchTerm] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selectedPersonName, setSelectedPersonName] = useState<string>('')
  const [selectedChatroomName, setSelectedChatroomName] = useState<string>('')

  // 处理选中联系人
  const handleSelectContact = (contact: Contact | ChatRoom) => {
    if ('name' in contact) {
      // 群聊 - 选择的值取name字段，展示的是nickName字段
      setSelectedChatroomName(contact.nickName)
      onSelectedContactsUpdate(contact.name, contact.nickName)
    } else {
      // 个人 - 选择的值取userName字段，展示的是remark字段
      setSelectedPersonName(contact.remark || contact.nickName)
      onSelectedContactsUpdate(contact.userName, contact.remark || contact.nickName)
    }
    setIsPopoverOpen(false)
    setSearchTerm('')
  }

  const onClearAll = () => {
    setSelectedPersonName('')
    setSelectedChatroomName('')
    onSelectedContactsUpdate(null, null)
  }

  // 计算属性：根据 targetType 返回相应的选中项
  const selectedContact = useMemo(() => {
    return targetType === 'personal' ? selectedPersonName : selectedChatroomName
  }, [targetType, selectedPersonName, selectedChatroomName])

  // 计算属性：获取过滤后的联系人列表
  const filteredContacts = useMemo(() => {
    const contacts = targetType === 'personal' ? personalContacts : chatRooms
    const searchStr = searchTerm.toLocaleLowerCase()

    const list = contacts
      .filter((contact) => {
        if (targetType === 'personal') {
          return (
            contact.remark.toLocaleLowerCase().includes(searchStr) ||
            contact.nickName.toLocaleLowerCase().includes(searchStr)
          )
        } else {
          return contact.nickName.toLocaleLowerCase().includes(searchStr)
        }
      })
      .slice(0, 10) // 限制最多显示10条数据

    console.log('list', list)
    return list
  }, [targetType, personalContacts, chatRooms, searchTerm])

  // 处理分析对象类型变化
  const onTargetTypeChange = (value: 'personal' | 'chatroom') => {
    setTargetType(value)
    setSearchTerm('')
    setIsPopoverOpen(false)
    // 切换类型时清空选择
    onClearAll()
  }

  // 渲染联系人头像
  const renderContactAvatar = (contact: Contact | ChatRoom) => {
    const isGroup = 'name' in contact
    const initial = isGroup
      ? contact.name.charAt(0).toUpperCase()
      : (contact.remark || contact.nickName).charAt(0).toUpperCase()

    return (
      <Avatar className="w-8 h-8">
        <AvatarFallback
          className={isGroup ? 'text-primary bg-primary/10' : 'text-primary bg-primary/10'}
        >
          {isGroup ? <GroupIcon className="w-4 h-4" /> : initial}
        </AvatarFallback>
      </Avatar>
    )
  }

  // 渲染联系人信息
  const renderContactInfo = (contact: Contact | ChatRoom) => {
    const displayName =
      'name' in contact
        ? contact.nickName // 群聊显示nickName
        : contact.remark || contact.nickName // 个人显示remark，没有则显示nickName

    return (
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium truncate">{displayName}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="space-y-6">
        {/* 分析对象类型选择 */}
        <div className="flex gap-4 items-center">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            分析对象
          </Label>
          <div className="flex-1">
            <ToggleGroup
              type="single"
              value={targetType}
              onValueChange={(value) =>
                value && onTargetTypeChange(value as 'personal' | 'chatroom')
              }
              className="justify-start"
            >
              <ToggleGroupItem value="personal" className="flex gap-2 items-center">
                <Users className="w-4 h-4" />
                好友聊天
              </ToggleGroupItem>
              <ToggleGroupItem value="chatroom" className="flex gap-2 items-center">
                <GroupIcon className="w-4 h-4" />
                群聊
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* 联系人选择 */}
        <div className="flex gap-4 items-start">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-foreground mt-2">
            选择{targetType === 'personal' ? '好友' : '群聊'}
          </Label>
          <div className="flex-1">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between w-80 font-normal text-left"
                >
                  <div className="flex items-center">
                    <Search className="mr-2 w-4 h-4 shrink-0" />
                    {!selectedContact ? (
                      <span className="text-muted-foreground">
                        选择{targetType === 'personal' ? '好友' : '群聊'}
                      </span>
                    ) : (
                      <span>{selectedContact}</span>
                    )}
                  </div>
                  {selectedContact && (
                    <div
                      className="p-1 h-auto rounded transition-colors cursor-pointer hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClearAll()
                      }}
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80" align="start">
                <Command>
                  <CommandInput
                    placeholder={`搜索${targetType === 'personal' ? '好友' : '群聊'}...`}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    {(targetType === 'personal' ? personalContacts : chatRooms).length > 0 &&
                    filteredContacts.length > 0 ? (
                      <div className="overflow-hidden p-1 text-foreground">
                        {/* 分组标题 */}
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          {targetType === 'personal' ? '个人联系人' : '群聊'}
                        </div>
                        {/* 联系人列表 */}
                        {filteredContacts.map((contact) => {
                          const displayValue =
                            'name' in contact
                              ? contact.nickName // 群聊显示nickName
                              : contact.remark || contact.nickName // 个人显示remark
                          return (
                            <div
                              key={contact.id}
                              onClick={() => handleSelectContact(contact)}
                              className="flex relative gap-3 items-center p-3 text-sm rounded-sm transition-colors cursor-default outline-none select-none hover:bg-accent hover:text-accent-foreground"
                            >
                              {renderContactAvatar(contact)}
                              {renderContactInfo(contact)}
                              {selectedContact === displayValue && (
                                <UserCheck className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-center text-muted-foreground">
                        暂无{targetType === 'personal' ? '好友' : '群聊'}数据
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
