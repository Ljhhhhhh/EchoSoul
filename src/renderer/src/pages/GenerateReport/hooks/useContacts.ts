/**
 * 联系人数据管理Hook
 */
import { useState, useEffect } from 'react'
import type { Contact, ChatRoom } from '@types'
import { ContactService } from '../services/contactService'

interface ContactsState {
  personalContacts: Contact[]
  chatRooms: ChatRoom[]
  currentSearchType: 'individual' | 'group'
  searchTerm: string
  checkedContacts?: string[]
  isPopoverOpen: boolean
  isLoading: boolean
  error: string | null
}

export const useContacts = () => {
  const [state, setState] = useState<ContactsState>({
    personalContacts: [],
    chatRooms: [],
    currentSearchType: 'individual',
    searchTerm: '',
    checkedContacts: [],
    isPopoverOpen: false,
    isLoading: false,
    error: null
  })

  // 获取联系人数据
  const fetchContacts = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      await Promise.all([fetchPersonalContacts(), fetchChatRooms()])
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }))
    }
  }

  // TODO: 好友
  const fetchPersonalContacts = async () => {
    try {
      const contacts = await ContactService.fetchContacts()
      setState((prev) => ({ ...prev, personalContacts: contacts, isLoading: false }))
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }))
    }
  }

  // TODO: 群聊

  const fetchChatRooms = async () => {
    try {
      const chats = await ContactService.fetchChatRooms()
      setState((prev) => ({ ...prev, chatRooms: chats, isLoading: false }))
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }))
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchContacts()
  }, [])

  return {
    ...state,
    refetch: fetchContacts
  }
}
