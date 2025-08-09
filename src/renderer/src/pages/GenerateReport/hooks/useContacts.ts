/**
 * 联系人数据管理Hook
 */
import { useState, useEffect, useMemo } from 'react'
import type { Contact, ContactsState } from '../types'
import { ContactService } from '../services/contactService'

export const useContacts = () => {
  const [state, setState] = useState<ContactsState>({
    contacts: [],
    personalContacts: [],
    groupChats: [],
    searchableContacts: [],
    searchablePersonalContacts: [],
    searchableGroupChats: [],
    isLoading: false,
    error: null
  })

  // 获取联系人数据
  const fetchContacts = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { allContacts, personalContacts, groupChats } = await ContactService.fetchAllContacts()

      console.log('Fetched all contacts:', allContacts)
      console.log('Personal contacts:', personalContacts)
      console.log('Group chats:', groupChats)

      setState({
        contacts: allContacts,
        personalContacts,
        groupChats,
        searchableContacts: [],
        searchablePersonalContacts: [],
        searchableGroupChats: [],
        isLoading: false,
        error: null
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取联系人失败'
      }))
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchContacts()
  }, [])

  // 预处理搜索数据 - 分别为好友和群聊提供搜索数据
  const searchablePersonalContacts = useMemo(() => {
    return ContactService.prepareSearchableContacts(state.personalContacts)
  }, [state.personalContacts])

  const searchableGroupChats = useMemo(() => {
    return ContactService.prepareSearchableContacts(state.groupChats)
  }, [state.groupChats])

  // 保持向后兼容的合并搜索数据（如果其他地方需要用到）
  const searchableContacts = useMemo(() => {
    return ContactService.prepareSearchableContacts([
      ...state.personalContacts,
      ...state.groupChats
    ])
  }, [state.personalContacts, state.groupChats])

  return {
    ...state,
    searchableContacts,
    searchablePersonalContacts,
    searchableGroupChats,
    refetch: fetchContacts
  }
}
