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
import { c, s } from 'framer-motion/dist/types.d-Cjd591yU'

interface ContactSelectorProps {
  // 数据
  personalContacts: Contact[]
  chatRooms: ChatRoom[]
  // 更新选中的联系人
  initSelectedContacts: string[]
  onSelectedContactsUpdate: (contacts: string[]) => void
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
  const [selectedPersonNames, setSelectedPersonNames] = useState<string[]>([])
  const [selectedChatroomNames, setSelectedChatroomNames] = useState<string[]>([])

  // 处理选中联系人
  const handleSelectContact = (contact: Contact | ChatRoom) => {
    if ('name' in contact) {
      // 群聊
      setSelectedChatroomNames([...selectedChatroomNames, contact.name])
    } else {
      // 个人
      setSelectedPersonNames([...selectedPersonNames, contact.userName])
    }
    onSelectedContactsUpdate([...selectedContacts, contact.id])
  }

  const onClearAll = () => {
    setSelectedPersonNames([])
    setSelectedChatroomNames([])
    onSelectedContactsUpdate([])
  }

  // ! 分析对象的所有相关方法、变量应该在 hooks中，通过 useContactSelector 来管理，且联系人和群聊选项同时肯定只选一个
  const onRemoveContact = (contact: Contact | ChatRoom) => {
    if ('name' in contact) {
      setSelectedChatroomNames(selectedChatroomNames.filter((id) => id !== contact.id))
    } else {
      setSelectedPersonNames(selectedPersonNames.filter((id) => id !== contact.id))
    }
    onSelectedContactsUpdate(selectedContacts.filter((id) => id !== contact.id))
  }

  const onAddContact = (contact: Contact | ChatRoom) => {
    if ('name' in contact) {
      setSelectedChatroomNames([...selectedChatroomNames, contact.id])
    } else {
      setSelectedPersonNames([...selectedPersonNames, contact.id])
    }
    onSelectedContactsUpdate([...selectedContacts, contact.id])
  }

  // 计算属性：根据 targetType 返回相应的选中项数组
  const selectedContacts = useMemo(() => {
    return targetType === 'personal' ? selectedPersonNames : selectedChatroomNames
  }, [targetType, selectedPersonNames, selectedChatroomNames])

  // 处理分析对象类型变化
  const onTargetTypeChange = (value: 'personal' | 'chatroom') => {
    setTargetType(value)
    setSearchTerm('')
    setIsPopoverOpen(false)
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
  const renderContactInfo = (contact: Contact) => (
    <div className="flex-1 min-w-0">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium truncate">{contact.remark || contact.nickName}</span>
      </div>
    </div>
  )

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
                  className="justify-start w-full font-normal text-left"
                >
                  <Search className="mr-2 w-4 h-4 shrink-0" />
                  {selectedContacts.length === 0 ? (
                    <span className="text-gray-500">
                      选择{targetType === 'personal' ? '好友' : '群聊'}
                    </span>
                  ) : (
                    <span>
                      已选择 {selectedContacts.length} 个
                      {targetType === 'personal' ? '好友' : '群聊'}
                    </span>
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
                            const name = 'name' in contact ? contact.name : contact.nickName
                            return name.toLowerCase().includes(searchTerm.toLowerCase())
                          })
                          .map((contact) => {
                            const contactId = 'name' in contact ? contact.name : contact.userName
                            return (
                              <CommandItem
                                key={contactId}
                                onSelect={() => onAddContact(contact)}
                                className="flex gap-3 items-center p-3"
                              >
                                {renderContactAvatar(contact)}
                                {renderContactInfo(contact as Contact)}
                                {selectedContacts.includes(contactId) && (
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

        {/* 已选择的联系人展示 */}
        {selectedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-[116px] space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                已选择{targetType === 'personal' ? '好友' : '群聊'} ({selectedContacts.length})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-gray-500 hover:text-red-500"
              >
                清空全部
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedContacts.map((contact, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex gap-2 items-center py-1 pr-1 pl-3"
                >
                  <span className="text-xs">{contact}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 hover:bg-red-100"
                    onClick={() => {
                      if (targetType === 'personal') {
                        setSelectedPersonNames(selectedPersonNames.filter((n) => n !== contact))
                      } else {
                        setSelectedChatroomNames(selectedChatroomNames.filter((n) => n !== contact))
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
