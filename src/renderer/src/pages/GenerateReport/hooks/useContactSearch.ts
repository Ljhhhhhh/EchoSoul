/**
 * 联系人搜索Hook
 */
import { useState, useMemo } from 'react'
import type { ContactSearchState, ContactSearchable } from '../types'
import { ContactService } from '../services/contactService'

interface UseContactSearchProps {
  searchableContacts: ContactSearchable[]
}

export const useContactSearch = ({ searchableContacts }: UseContactSearchProps) => {
  const [searchState, setSearchState] = useState<ContactSearchState>({
    searchTerm: '',
    filteredContacts: [],
    isPopoverOpen: false
  })

  // 执行搜索过滤
  const filteredContacts = useMemo(() => {
    return ContactService.searchContacts(searchableContacts, searchState.searchTerm)
  }, [searchableContacts, searchState.searchTerm])

  // 更新搜索词
  const updateSearchTerm = (term: string) => {
    setSearchState((prev) => ({
      ...prev,
      searchTerm: term
    }))
  }

  // 切换弹窗状态
  const togglePopover = (isOpen?: boolean) => {
    setSearchState((prev) => ({
      ...prev,
      isPopoverOpen: isOpen !== undefined ? isOpen : !prev.isPopoverOpen
    }))
  }

  // 清空搜索
  const clearSearch = () => {
    setSearchState((prev) => ({
      ...prev,
      searchTerm: ''
    }))
  }

  return {
    searchTerm: searchState.searchTerm,
    filteredContacts,
    isPopoverOpen: searchState.isPopoverOpen,
    updateSearchTerm,
    togglePopover,
    clearSearch
  }
}
