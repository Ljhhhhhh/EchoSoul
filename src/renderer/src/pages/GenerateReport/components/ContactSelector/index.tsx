/**
 * 联系人选择组件 - 完整实现
 */
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, X, UserCheck, Users as GroupIcon } from 'lucide-react'
import { Label } from '../../../../components/ui/label'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '../../../../components/ui/toggle-group'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup
} from '../../../../components/ui/command'
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar'
import type { Contact } from '../../types'

interface ContactSelectorProps {
  // 数据
  personalContacts: Contact[]
  groupChats: Contact[]
  selectedContacts: string[]
  searchTerm: string
  isPopoverOpen: boolean
  targetType: 'individual' | 'group'

  // 回调函数
  onSearchChange: (term: string) => void
  onTogglePopover: (isOpen: boolean) => void
  onAddContact: (contactId: string) => void
  onRemoveContact: (contactId: string) => void
  onClearAll: () => void
  onTargetTypeChange: (type: 'individual' | 'group') => void

  // 可选配置
  maxDisplayContacts?: number
  placeholder?: string
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  personalContacts,
  groupChats,
  selectedContacts,
  searchTerm,
  isPopoverOpen,
  targetType,
  onSearchChange,
  onTogglePopover,
  onAddContact,
  onRemoveContact,
  onClearAll,
  onTargetTypeChange,
  maxDisplayContacts = 200,
  placeholder = '搜索联系人或群聊...'
}) => {
  // 根据目标类型获取当前可选的联系人
  const currentContacts = useMemo(() => {
    console.log('当前联系人:', targetType, personalContacts)
    console.log('当前群聊:', groupChats)
    return targetType === 'individual' ? personalContacts : groupChats
  }, [targetType, personalContacts, groupChats])

  // 获取已选择的联系人信息
  const selectedContactsInfo = useMemo(() => {
    const allContacts = [...personalContacts, ...groupChats]
    return selectedContacts
      .map((id) => allContacts.find((contact) => contact.id === id))
      .filter(Boolean) as Contact[]
  }, [selectedContacts, personalContacts, groupChats])

  // 过滤后的联系人列表 - 移除 useMemo 以解决中文输入法问题
  const getFilteredContacts = () => {
    if (!searchTerm.trim()) {
      return currentContacts.slice(0, maxDisplayContacts)
    }

    const term = searchTerm.toLowerCase()

    return currentContacts
      .filter((contact) => {
        // 根据联系人类型采用不同的搜索策略
        if (contact.type === 'individual') {
          // 好友：优先按 remark 搜索，然后是 nickName、alias、userName
          const remarkMatch = contact.remark?.toLowerCase().includes(term)
          const nameMatch = contact.nickName.toLowerCase().includes(term)
          const aliasMatch = contact.alias?.toLowerCase().includes(term)
          const userNameMatch = contact.userName?.toLowerCase().includes(term)

          if (remarkMatch || nameMatch || aliasMatch || userNameMatch) {
            return true
          }
        } else {
          console.log('群聊搜索:', contact)
          // 群聊：优先按 nickName 搜索，然后是 name、remark
          const nameMatch = contact.nickName.toLowerCase().includes(term)
          const idMatch = contact.name?.toLowerCase().includes(term)
          const remarkMatch = contact.remark?.toLowerCase().includes(term)

          if (nameMatch || idMatch || remarkMatch) {
            return true
          }
        }

        return false
      })
      .slice(0, maxDisplayContacts)
  }

  const filteredContacts = getFilteredContacts()

  // 渲染联系人头像
  const renderContactAvatar = (contact: Contact) => {
    const initial = contact.nickName.charAt(0).toUpperCase()
    const isGroup = contact.type === 'group'

    return (
      <Avatar className="w-8 h-8">
        <AvatarFallback
          className={isGroup ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}
        >
          {isGroup ? <GroupIcon className="w-4 h-4" /> : initial}
        </AvatarFallback>
      </Avatar>
    )
  }

  // 渲染联系人信息
  const renderContactInfo = (contact: Contact) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-4">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5 text-green-500" />
            分析对象
          </Label>
          <div className="flex-1">
            <ToggleGroup
              type="single"
              value={targetType}
              onValueChange={(value) =>
                value && onTargetTypeChange(value as 'individual' | 'group')
              }
              className="justify-start"
            >
              <ToggleGroupItem value="individual" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                好友聊天
              </ToggleGroupItem>
              <ToggleGroupItem value="group" className="flex items-center gap-2">
                <GroupIcon className="w-4 h-4" />
                群聊
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* 联系人选择 */}
        <div className="flex items-start gap-4">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700 mt-2">
            选择{targetType === 'individual' ? '好友' : '群聊'}
          </Label>
          <div className="flex-1">
            <Popover open={isPopoverOpen} onOpenChange={onTogglePopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-start w-full font-normal text-left"
                >
                  <Search className="w-4 h-4 mr-2 shrink-0" />
                  {selectedContacts.length === 0 ? (
                    <span className="text-gray-500">
                      选择{targetType === 'individual' ? '好友' : '群聊'}
                    </span>
                  ) : (
                    <span>
                      已选择 {selectedContacts.length} 个
                      {targetType === 'individual' ? '好友' : '群聊'}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80" align="start">
                <Command>
                  <CommandInput
                    placeholder={`搜索${targetType === 'individual' ? '好友' : '群聊'}...`}
                    value={searchTerm}
                    onValueChange={onSearchChange}
                  />
                  <CommandList>
                    <CommandEmpty>
                      未找到匹配的{targetType === 'individual' ? '好友' : '群聊'}
                    </CommandEmpty>

                    {currentContacts.length > 0 ? (
                      <CommandGroup heading={targetType === 'individual' ? '个人联系人' : '群聊'}>
                        {filteredContacts.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            onSelect={() => onAddContact(contact.id)}
                            className="flex items-center gap-3 p-3"
                          >
                            {renderContactAvatar(contact)}
                            {renderContactInfo(contact)}
                            {selectedContacts.includes(contact.id) && (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <div className="p-4 text-sm text-center text-gray-500">
                        暂无{targetType === 'individual' ? '好友' : '群聊'}数据
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 已选择的联系人展示 */}
        {selectedContactsInfo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-[116px] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                已选择{targetType === 'individual' ? '好友' : '群聊'} ({selectedContactsInfo.length}
                )
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
              {selectedContactsInfo.map((contact) => (
                <Badge
                  key={contact.id}
                  variant="secondary"
                  className="flex items-center gap-2 py-1 pl-3 pr-1"
                >
                  <span className="text-xs">{contact.nickName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 hover:bg-red-100"
                    onClick={() => onRemoveContact(contact.id)}
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
