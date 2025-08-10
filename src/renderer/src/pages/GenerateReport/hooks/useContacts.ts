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
  }

  // TODO: 好友

  // TODO: 群聊

  // 组件加载时获取数据
  useEffect(() => {
    fetchContacts()
  }, [])

  return {
    ...state,
    refetch: fetchContacts
  }
}
