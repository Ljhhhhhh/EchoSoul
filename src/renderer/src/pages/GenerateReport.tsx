import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sparkles,
  Calendar,
  Users,
  Wand2,
  X,
  UserPlus,
  UsersIcon,
  Clock,
  Bookmark,
  Trash2,
  FileText,
  TrendingUp,
  ChevronDown,
  Check,
  RefreshCw
} from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { PromptTemplate } from '../pages/Settings/types'

// 类型定义
interface Contact {
  userName: string
  nickName?: string
}

// 条件记录类型定义
interface SavedCondition {
  id: string
  name: string
  timeRange: string
  customStartDate: string
  customEndDate: string
  targetType: string
  selectedContacts: string[]
  analysisType: string
  customPrompt: string
  createdAt: string
  usageCount: number
}

const GenerateReport = (): React.ReactElement => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    timeRange: '',
    customStartDate: '',
    customEndDate: '',
    targetType: '',
    selectedContacts: [] as string[],
    analysisType: '',
    customPrompt: ''
  })

  // 条件记录相关状态
  const [savedConditions, setSavedConditions] = useState<SavedCondition[]>([])
  const [showSavedConditions, setShowSavedConditions] = useState(false)

  // 联系人相关状态
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [contactsError, setContactsError] = useState<string | null>(null)

  // UI状态管理
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [isContactPopoverOpen, setIsContactPopoverOpen] = useState(false)

  const timeRanges = [
    { value: 'yesterday', label: '昨天' },
    { value: 'last_week', label: '最近一周' },
    { value: 'last_month', label: '最近一个月' },
    { value: 'last_3_months', label: '最近三个月' },
    { value: 'custom', label: '自定义时间' }
  ]

  // 模拟Prompt数据
  const mockPrompts: PromptTemplate[] = [
    {
      id: '1',
      name: '情感分析专家',
      content: '请分析聊天记录中的情感变化趋势，识别主要情绪状态...',
      isBuiltIn: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: '关系洞察师',
      content: '深度分析聊天双方的关系模式，包括互动频率、话题偏好...',
      isBuiltIn: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: '沟通模式分析',
      content: '分析沟通风格、表达习惯和互动模式...',
      isBuiltIn: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: '工作氛围评估',
      content: '评估团队协作氛围、工作效率和团队凝聚力...',
      isBuiltIn: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  // 获取真实联系人数据
  const fetchContacts = async () => {
    setIsLoadingContacts(true)
    setContactsError(null)

    try {
      // 调用IPC获取联系人数据
      const contacts = await window.api.chatlog.getContacts()
      console.log('Fetched contacts:', contacts)

      if (Array.isArray(contacts)) {
        setContacts(contacts)
      } else {
        throw new Error('获取联系人数据失败')
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      setContactsError(error instanceof Error ? error.message : '获取联系人失败')
      // 设置空数组作为后备
      setContacts([])
    } finally {
      setIsLoadingContacts(false)
    }
  }

  // 分离个人联系人和群聊
  const { personalContacts, groupChats } = useMemo(() => {
    const personal = contacts.filter((contact) => contact.type === 'individual')
    const groups = contacts.filter((contact) => contact.type === 'group')
    return { personalContacts: personal, groupChats: groups }
  }, [contacts])

  // 过滤联系人
  const filteredContacts = useMemo(() => {
    const allContacts = [...personalContacts, ...groupChats]
    if (!contactSearchTerm) return allContacts

    return allContacts.filter((contact) =>
      contact.nickName.toLowerCase().includes(contactSearchTerm.toLowerCase())
    )
  }, [personalContacts, groupChats, contactSearchTerm])

  // 获取已选择的联系人信息
  const selectedContactsInfo = useMemo(() => {
    const allContacts = [...personalContacts, ...groupChats]
    return formData.selectedContacts
      .map((id) => allContacts.find((contact) => contact.id === id))
      .filter(Boolean)
  }, [formData.selectedContacts, personalContacts, groupChats])

  // 动态计算数据统计
  const calculateDataStats = useMemo(() => {
    if (!formData.timeRange || formData.selectedContacts.length === 0) {
      return { messageCount: 0, daysCovered: 0, contactsInvolved: 0 }
    }

    // 根据时间范围计算天数
    let daysCovered = 1
    switch (formData.timeRange) {
      case 'yesterday':
        daysCovered = 1
        break
      case 'last_week':
        daysCovered = 7
        break
      case 'last_month':
        daysCovered = 30
        break
      case 'last_3_months':
        daysCovered = 90
        break
      case 'custom':
        daysCovered = 7
        break
    }

    // 根据分析对象计算联系人数量
    let contactsInvolved = 0
    let baseMessageCount = 50

    if (formData.targetType === 'all') {
      contactsInvolved = personalContacts.length + groupChats.length
    } else if (formData.targetType === 'groups') {
      contactsInvolved = groupChats.length
      baseMessageCount = 120
    } else {
      contactsInvolved = formData.selectedContacts.length
      // 检查是否包含群聊，群聊消息更多
      const hasGroups = formData.selectedContacts.some((id) => groupChats.some((g) => g.id === id))
      if (hasGroups) {
        baseMessageCount = 80
      }
    }

    const messageCount = Math.round(
      contactsInvolved * daysCovered * baseMessageCount * (0.8 + Math.random() * 0.4)
    )

    return { messageCount, daysCovered, contactsInvolved }
  }, [
    formData.timeRange,
    formData.targetType,
    formData.selectedContacts,
    personalContacts,
    groupChats
  ])

  // 从localStorage加载保存的条件
  useEffect(() => {
    const saved = localStorage.getItem('savedReportConditions')
    if (saved) {
      try {
        setSavedConditions(JSON.parse(saved))
        setShowSavedConditions(true)
      } catch (error) {
        console.error('Failed to load saved conditions:', error)
      }
    }
  }, [])

  // 获取联系人数据
  useEffect(() => {
    fetchContacts()
  }, [])

  // 保存条件到localStorage
  const saveConditionsToStorage = (conditions: SavedCondition[]) => {
    localStorage.setItem('savedReportConditions', JSON.stringify(conditions))
    setSavedConditions(conditions)
  }

  // 生成条件名称
  const generateConditionName = (data: typeof formData): string => {
    const timeLabel = timeRanges.find((t) => t.value === data.timeRange)?.label || '自定义时间'
    const analysisLabel = selectedPrompt?.name || '未选择分析类型'

    let targetLabel = '全部聊天'
    if (data.targetType === 'specific') {
      targetLabel =
        data.selectedContacts.length > 0 ? `${data.selectedContacts.length}个联系人` : '特定联系人'
    } else if (data.targetType === 'groups') {
      targetLabel = '群聊'
    }

    return `${timeLabel} · ${targetLabel} · ${analysisLabel}`
  }

  // 保存当前条件
  const saveCurrentCondition = () => {
    const newCondition: SavedCondition = {
      id: Date.now().toString(),
      name: generateConditionName(formData),
      ...formData,
      createdAt: new Date().toISOString(),
      usageCount: 1
    }

    const existingIndex = savedConditions.findIndex(
      (condition) =>
        condition.timeRange === formData.timeRange &&
        condition.targetType === formData.targetType &&
        condition.analysisType === formData.analysisType &&
        JSON.stringify(condition.selectedContacts.sort()) ===
          JSON.stringify(formData.selectedContacts.sort())
    )

    let updatedConditions: SavedCondition[]
    if (existingIndex >= 0) {
      updatedConditions = [...savedConditions]
      updatedConditions[existingIndex].usageCount += 1
    } else {
      updatedConditions = [newCondition, ...savedConditions].slice(0, 10)
    }

    saveConditionsToStorage(updatedConditions)
  }

  // 应用保存的条件
  const applySavedCondition = (condition: SavedCondition) => {
    setFormData({
      timeRange: condition.timeRange,
      customStartDate: condition.customStartDate,
      customEndDate: condition.customEndDate,
      targetType: condition.targetType,
      selectedContacts: condition.selectedContacts,
      analysisType: condition.analysisType,
      customPrompt: condition.customPrompt
    })

    const updatedConditions = savedConditions.map((c) =>
      c.id === condition.id ? { ...c, usageCount: c.usageCount + 1 } : c
    )
    saveConditionsToStorage(updatedConditions)

    toast({
      title: '条件已应用',
      description: `已应用"${condition.name}"的配置`
    })
  }

  // 删除保存的条件
  const deleteSavedCondition = (id: string) => {
    const updatedConditions = savedConditions.filter((c) => c.id !== id)
    saveConditionsToStorage(updatedConditions)
    toast({
      title: '已删除',
      description: '条件记录已删除'
    })
  }

  // 添加联系人
  const addContact = (contactId: string) => {
    if (!formData.selectedContacts.includes(contactId)) {
      setFormData((prev) => ({
        ...prev,
        selectedContacts: [...prev.selectedContacts, contactId]
      }))
    }
    setContactSearchTerm('')
  }

  // 移除联系人
  const removeContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: prev.selectedContacts.filter((id) => id !== contactId)
    }))
  }

  // 清空所有联系人
  const clearAllContacts = () => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: []
    }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsGenerating(true)

    saveCurrentCondition()

    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: '报告生成成功！',
        description: '你的个性化分析报告已经准备好了。'
      })
      navigate('/history')
    }, 3000)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成分析报告</h1>
              <p className="text-gray-600">配置你的个性化聊天分析</p>
            </div>
          </div>

          {/* 快速选择区域 */}
          {savedConditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-amber-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                      <Clock className="w-5 h-5" />
                      快速选择
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedConditions(!showSavedConditions)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      {showSavedConditions ? '收起' : '展开'}
                    </Button>
                  </div>
                  <CardDescription>使用之前保存的分析条件快速生成报告</CardDescription>
                </CardHeader>
                {showSavedConditions && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {savedConditions
                        .sort((a, b) => b.usageCount - a.usageCount)
                        .slice(0, 6)
                        .map((condition) => (
                          <div
                            key={condition.id}
                            className="relative p-3 transition-all border border-orange-200 rounded-lg cursor-pointer group bg-white/50 hover:bg-white/80"
                            onClick={() => applySavedCondition(condition)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-800 truncate">
                                  {condition.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    <Bookmark className="w-3 h-3 mr-1" />
                                    使用 {condition.usageCount} 次
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    {new Date(condition.createdAt).toLocaleDateString('zh-CN', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-gray-400 transition-opacity opacity-0 group-hover:opacity-100 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSavedCondition(condition.id)
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}

          {/* 主要配置区域 */}
          <div className="grid grid-cols-3 gap-8">
            {/* 左侧：配置区域 */}
            <div className="col-span-2">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-800">分析配置</CardTitle>
                  <CardDescription>配置你的聊天记录分析参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 时间范围选择 */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            时间范围
                          </Label>
                          <Select
                            value={formData.timeRange}
                            onValueChange={(value) =>
                              setFormData((prev) => ({ ...prev, timeRange: value }))
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="选择时间范围" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.timeRange === 'custom' && (
                          <div className="flex items-center gap-4 ml-[116px]">
                            <div>
                              <Label htmlFor="startDate" className="text-xs text-gray-500">
                                开始日期
                              </Label>
                              <Input
                                id="startDate"
                                type="date"
                                value={formData.customStartDate}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    customStartDate: e.target.value
                                  }))
                                }
                                className="w-40"
                              />
                            </div>
                            <div>
                              <Label htmlFor="endDate" className="text-xs text-gray-500">
                                结束日期
                              </Label>
                              <Input
                                id="endDate"
                                type="date"
                                value={formData.customEndDate}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    customEndDate: e.target.value
                                  }))
                                }
                                className="w-40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* 联系人选择 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
                            <Users className="w-5 h-5 text-green-500" />
                            分析对象
                          </Label>
                          <div className="flex-1">
                            <Popover
                              open={isContactPopoverOpen}
                              onOpenChange={setIsContactPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={isContactPopoverOpen}
                                  className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
                                >
                                  <div className="flex items-center flex-1 gap-2">
                                    {selectedContactsInfo.length === 0 ? (
                                      <>
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500">搜索联系人或群聊...</span>
                                      </>
                                    ) : (
                                      <div className="flex flex-wrap flex-1 gap-1">
                                        {selectedContactsInfo.slice(0, 3).map((contact) => (
                                          <Badge
                                            key={contact.id}
                                            variant="secondary"
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            {contact.type === 'group' ? (
                                              <UsersIcon className="w-3 h-3" />
                                            ) : (
                                              <UserPlus className="w-3 h-3" />
                                            )}
                                            <span className="truncate max-w-16">
                                              {contact.name}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-auto p-0 ml-1 hover:bg-transparent"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                removeContact(contact.id)
                                              }}
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </Badge>
                                        ))}
                                        {selectedContactsInfo.length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{selectedContactsInfo.length - 3} 更多
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-80" align="start">
                                <Command>
                                  <CommandInput
                                    placeholder="搜索联系人或群聊..."
                                    value={contactSearchTerm}
                                    onValueChange={setContactSearchTerm}
                                  />
                                  <CommandList className="max-h-64">
                                    {isLoadingContacts ? (
                                      <div className="flex items-center justify-center p-4">
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        <span className="text-sm text-gray-500">
                                          加载联系人中...
                                        </span>
                                      </div>
                                    ) : contactsError ? (
                                      <div className="p-4 space-y-2">
                                        <div className="text-sm text-red-600">{contactsError}</div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={fetchContacts}
                                          className="w-full"
                                        >
                                          <RefreshCw className="w-3 h-3 mr-2" />
                                          重新加载
                                        </Button>
                                      </div>
                                    ) : filteredContacts.length === 0 ? (
                                      <CommandEmpty>没有找到匹配的联系人</CommandEmpty>
                                    ) : (
                                      <>
                                        {/* 快捷选项 */}
                                        <CommandGroup heading="快捷选择">
                                          <CommandItem
                                            onSelect={() => {
                                              setFormData((prev) => ({
                                                ...prev,
                                                selectedContacts: [],
                                                targetType: 'all'
                                              }))
                                              setIsContactPopoverOpen(false)
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>全部聊天</span>
                                          </CommandItem>
                                          <CommandItem
                                            onSelect={() => {
                                              const groupIds = groupChats.map((g) => g.id)
                                              setFormData((prev) => ({
                                                ...prev,
                                                selectedContacts: groupIds,
                                                targetType: 'groups'
                                              }))
                                              setIsContactPopoverOpen(false)
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <UsersIcon className="w-4 h-4 mr-2" />
                                            <span>所有群聊</span>
                                          </CommandItem>
                                        </CommandGroup>

                                        {/* 个人联系人 */}
                                        {filteredContacts.filter((c) => c.type === 'individual')
                                          .length > 0 && (
                                          <CommandGroup heading="个人联系人">
                                            {filteredContacts
                                              .filter((c) => c.type === 'individual')
                                              .slice(0, 15)
                                              .map((contact) => (
                                                <CommandItem
                                                  key={contact.id}
                                                  onSelect={() => {
                                                    if (
                                                      formData.selectedContacts.includes(contact.id)
                                                    ) {
                                                      removeContact(contact.id)
                                                    } else {
                                                      addContact(contact.id)
                                                    }
                                                  }}
                                                  className="cursor-pointer"
                                                >
                                                  <UserPlus className="w-4 h-4 mr-2" />
                                                  <span>{contact.name}</span>
                                                  {formData.selectedContacts.includes(
                                                    contact.id
                                                  ) && (
                                                    <Check className="w-4 h-4 ml-auto text-green-600" />
                                                  )}
                                                </CommandItem>
                                              ))}
                                          </CommandGroup>
                                        )}

                                        {/* 群聊 */}
                                        {filteredContacts.filter((c) => c.type === 'group').length >
                                          0 && (
                                          <CommandGroup heading="群聊">
                                            {filteredContacts
                                              .filter((c) => c.type === 'group')
                                              .slice(0, 15)
                                              .map((group) => (
                                                <CommandItem
                                                  key={group.id}
                                                  onSelect={() => {
                                                    if (
                                                      formData.selectedContacts.includes(group.id)
                                                    ) {
                                                      removeContact(group.id)
                                                    } else {
                                                      addContact(group.id)
                                                    }
                                                  }}
                                                  className="cursor-pointer"
                                                >
                                                  <UsersIcon className="w-4 h-4 mr-2" />
                                                  <span>{group.name}</span>
                                                  <span className="ml-auto mr-2 text-xs text-gray-500">
                                                    {(group as any).memberCount} 人
                                                  </span>
                                                  {formData.selectedContacts.includes(group.id) && (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                  )}
                                                </CommandItem>
                                              ))}
                                          </CommandGroup>
                                        )}
                                      </>
                                    )}
                                  </CommandList>

                                  {/* 底部操作 */}
                                  {selectedContactsInfo.length > 0 && (
                                    <div className="p-2 border-t">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          clearAllContacts()
                                          setContactSearchTerm('')
                                        }}
                                        className="w-full text-xs text-gray-500 hover:text-red-500"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        清空所有选择
                                      </Button>
                                    </div>
                                  )}
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Prompt选择 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
                            <FileText className="w-5 h-5 text-purple-500" />
                            分析模板
                          </Label>
                          <Select
                            value={selectedPrompt?.id || ''}
                            onValueChange={(value) => {
                              const prompt = mockPrompts.find((p) => p.id === value)
                              setSelectedPrompt(prompt || null)
                              setFormData((prev) => ({ ...prev, analysisType: value }))
                            }}
                          >
                            <SelectTrigger className="w-80">
                              <SelectValue placeholder="选择分析模板" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockPrompts.map((prompt) => (
                                <SelectItem key={prompt.id} value={prompt.id}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span>{prompt.name}</span>
                                    {prompt.isBuiltIn && (
                                      <Badge variant="secondary" className="text-xs">
                                        内置
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPrompt && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="ml-[116px] p-4 bg-purple-50 border border-purple-200 rounded-lg"
                          >
                            <div className="text-sm text-purple-700">
                              <div className="mb-1 font-medium">模板预览：</div>
                              <div className="text-purple-600 line-clamp-2">
                                {selectedPrompt.content}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：预览和操作区域 */}
            <div className="space-y-4">
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">配置预览</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 当前配置摘要 */}
                  <div className="p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">时间：</span>
                        <span className="font-medium">
                          {timeRanges.find((t) => t.value === formData.timeRange)?.label ||
                            '未选择'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">对象：</span>
                        <span className="font-medium">
                          {formData.selectedContacts.length === 0 && '未选择'}
                          {formData.targetType === 'all' && '全部聊天'}
                          {formData.targetType === 'groups' && '所有群聊'}
                          {formData.selectedContacts.length > 0 &&
                            formData.targetType !== 'all' &&
                            formData.targetType !== 'groups' &&
                            `${formData.selectedContacts.length} 个联系人`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">模板：</span>
                        <span className="font-medium">{selectedPrompt?.name || '未选择'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 数据统计预览 */}
                  {formData.timeRange && formData.selectedContacts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <div className="text-sm font-medium text-blue-800">预计数据量</div>
                      </div>
                      <div className="mb-1 text-2xl font-bold text-blue-900">
                        {calculateDataStats.messageCount.toLocaleString()} 条消息
                      </div>
                      <div className="text-sm text-blue-600">
                        覆盖 {calculateDataStats.daysCovered} 天，
                        {calculateDataStats.contactsInvolved} 个联系人
                      </div>
                    </motion.div>
                  )}

                  {/* 生成按钮 */}
                  <Button
                    type="submit"
                    disabled={
                      isGenerating ||
                      !formData.timeRange ||
                      !selectedPrompt ||
                      formData.selectedContacts.length === 0
                    }
                    className="w-full h-12 text-white shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                    onClick={handleSubmit}
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                        正在生成报告...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成分析报告
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GenerateReport
