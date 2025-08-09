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
    isLoading: false,
    error: null
  })

  // 获取联系人数据
  const fetchContacts = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const contacts = await ContactService.fetchContacts()
      const { personalContacts, groupChats } = ContactService.separateContacts(contacts)

      setState({
        contacts,
        personalContacts,
        groupChats,
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

  // 预处理搜索数据
  const searchableContacts = useMemo(() => {
    return ContactService.prepareSearchableContacts([
      ...state.personalContacts,
      ...state.groupChats
    ])
  }, [state.personalContacts, state.groupChats])

  return {
    ...state,
    searchableContacts,
    refetch: fetchContacts
  }
}
