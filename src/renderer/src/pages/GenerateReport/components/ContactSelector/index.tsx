/**
 * 联系人选择组件 - 完整实现
 */
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, X, UserCheck, Users as GroupIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  onSelectedContactsUpdate: (contacts: string) => void
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
      onSelectedContactsUpdate(contact.name)
    } else {
      // 个人 - 选择的值取userName字段，展示的是remark字段
      setSelectedPersonName(contact.remark || contact.nickName)
      onSelectedContactsUpdate(contact.userName)
    }
    setIsPopoverOpen(false)
  }

  const onClearAll = () => {
    setSelectedPersonName('')
    setSelectedChatroomName('')
    onSelectedContactsUpdate(null)
  }

  // 计算属性：根据 targetType 返回相应的选中项
  const selectedContact = useMemo(() => {
    return targetType === 'personal' ? selectedPersonName : selectedChatroomName
  }, [targetType, selectedPersonName, selectedChatroomName])

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
      : contact.nickName.charAt(0).toUpperCase()

    return (
      <Avatar className="w-8 h-8">
        <AvatarFallback
          className={isGroup ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100'}
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
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5 text-green-500" />
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
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700 mt-2">
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
                      <span className="text-gray-500">
                        选择{targetType === 'personal' ? '好友' : '群聊'}
                      </span>
                    ) : (
                      <span>{selectedContact}</span>
                    )}
                  </div>
                  {selectedContact && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto hover:bg-red-100 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClearAll()
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </Button>
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
                    <CommandEmpty>
                      未找到匹配的{targetType === 'personal' ? '好友' : '群聊'}
                    </CommandEmpty>

                    {(targetType === 'personal' ? personalContacts : chatRooms).length > 0 ? (
                      <CommandGroup heading={targetType === 'personal' ? '个人联系人' : '群聊'}>
                        {(targetType === 'personal' ? personalContacts : chatRooms)
                          .filter((contact) => {
                            const searchStr = searchTerm.toLocaleLowerCase()
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
                          .map((contact) => {
                            const displayValue =
                              'name' in contact
                                ? contact.nickName // 群聊显示nickName
                                : contact.remark || contact.nickName // 个人显示remark
                            return (
                              <CommandItem
                                key={contact.id}
                                onSelect={() => handleSelectContact(contact)}
                                className="flex gap-3 items-center p-3"
                              >
                                {renderContactAvatar(contact)}
                                {renderContactInfo(contact)}
                                {selectedContact === displayValue && (
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                )}
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    ) : (
                      <div className="p-4 text-sm text-center text-gray-500">
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
