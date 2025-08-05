import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Sparkles,
  Calendar,
  Users,
  MessageSquare,
  Wand2,
  X,
  UserPlus,
  UsersIcon,
  Clock,
  Bookmark,
  Trash2
} from 'lucide-react'
import { useToast } from '../hooks/use-toast'

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

  const timeRanges = [
    { value: 'yesterday', label: '昨天' },
    { value: 'last_week', label: '最近一周' },
    { value: 'last_month', label: '最近一个月' },
    { value: 'last_3_months', label: '最近三个月' },
    { value: 'custom', label: '自定义时间' }
  ]

  const analysisTypes = [
    { value: 'emotion', label: '情感分析' },
    { value: 'personality', label: '人格分析' },
    { value: 'relationship', label: '关系分析' },
    { value: 'work_atmosphere', label: '工作氛围' },
    { value: 'eq_improvement', label: '情商提升' },
    { value: 'thinking_traps', label: '思维陷阱' },
    { value: 'custom', label: '自定义分析' }
  ]

  // 生成模拟联系人数据
  const generateMockContacts = () => {
    const personalContacts = []
    const groupChats = []

    // 生成个人联系人
    const surnames = [
      '张',
      '李',
      '王',
      '刘',
      '陈',
      '杨',
      '赵',
      '黄',
      '周',
      '吴',
      '徐',
      '孙',
      '胡',
      '朱',
      '高',
      '林',
      '何',
      '郭',
      '马',
      '罗'
    ]
    const names = [
      '伟',
      '芳',
      '娜',
      '秀英',
      '敏',
      '静',
      '丽',
      '强',
      '磊',
      '军',
      '洋',
      '勇',
      '艳',
      '杰',
      '娟',
      '涛',
      '明',
      '超',
      '秀兰',
      '霞'
    ]

    for (let i = 0; i < 500; i++) {
      const surname = surnames[Math.floor(Math.random() * surnames.length)]
      const name = names[Math.floor(Math.random() * names.length)]
      personalContacts.push({
        id: `person_${i}`,
        name: `${surname}${name}${i > 100 ? i : ''}`,
        type: 'person',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${surname}${name}${i}`,
        lastChat: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 生成群聊
    const groupTypes = [
      '工作群',
      '家庭群',
      '朋友群',
      '同学群',
      '兴趣群',
      '学习群',
      '运动群',
      '游戏群'
    ]
    const groupNames = ['讨论组', '交流群', '分享群', '聊天群', '互助群', '活动群']

    for (let i = 0; i < 200; i++) {
      const type = groupTypes[Math.floor(Math.random() * groupTypes.length)]
      const name = groupNames[Math.floor(Math.random() * groupNames.length)]
      groupChats.push({
        id: `group_${i}`,
        name: `${type}_${name}${i > 50 ? i : ''}`,
        type: 'group',
        memberCount: Math.floor(Math.random() * 200) + 3,
        lastChat: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return { personalContacts, groupChats }
  }

  const { personalContacts, groupChats } = useMemo(() => generateMockContacts(), [])

  // 从localStorage加载保存的条件
  useEffect(() => {
    const saved = localStorage.getItem('savedReportConditions')
    if (saved) {
      try {
        setSavedConditions(JSON.parse(saved))
        // 如果有保存的条件，默认展开快速选择区域
        setShowSavedConditions(true)
      } catch (error) {
        console.error('Failed to load saved conditions:', error)
      }
    }
  }, [])

  // 保存条件到localStorage
  const saveConditionsToStorage = (conditions: SavedCondition[]) => {
    localStorage.setItem('savedReportConditions', JSON.stringify(conditions))
    setSavedConditions(conditions)
  }

  // 生成条件名称
  const generateConditionName = (data: typeof formData): string => {
    const timeLabel = timeRanges.find((t) => t.value === data.timeRange)?.label || '自定义时间'
    const analysisLabel =
      analysisTypes.find((t) => t.value === data.analysisType)?.label || '未知分析'

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

    // 检查是否已存在相同条件
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
      // 更新使用次数
      updatedConditions = [...savedConditions]
      updatedConditions[existingIndex].usageCount += 1
    } else {
      // 添加新条件，最多保存10个
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

    // 更新使用次数
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsGenerating(true)

    // 保存当前条件
    saveCurrentCondition()

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: '报告生成成功！',
        description: '你的个性化分析报告已经准备好了。'
      })
      navigate('/history')
    }, 3000)
  }

  const handleContactToggle = (contactId: string): void => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contactId)
        ? prev.selectedContacts.filter((c) => c !== contactId)
        : [...prev.selectedContacts, contactId]
    }))
  }

  const handleSelectAll = (): void => {
    const allContactIds = [...personalContacts.map((c) => c.id), ...groupChats.map((c) => c.id)]
    setFormData((prev) => ({
      ...prev,
      selectedContacts: allContactIds
    }))
  }

  const handleClearAll = (): void => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: []
    }))
  }

  const getContactById = (id: string) => {
    return personalContacts.find((c) => c.id === id) || groupChats.find((c) => c.id === id)
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">生成分析报告</h1>
          <p className="text-sm text-gray-600">配置你的个性化聊天分析</p>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
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
                    {savedConditions.length > 6 && (
                      <div className="mt-3 text-center">
                        <span className="text-sm text-gray-500">
                          显示最常用的 6 个条件，共 {savedConditions.length} 个
                        </span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Time Range Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Calendar className="w-5 h-5" />
                    选择时间范围
                  </CardTitle>
                  <CardDescription>选择要分析的聊天记录时间范围</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={formData.timeRange}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, timeRange: value }))
                    }
                  >
                    <SelectTrigger>
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

                  {formData.timeRange === 'custom' && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="startDate">开始日期</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.customStartDate}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, customStartDate: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">结束日期</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.customEndDate}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, customEndDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Users className="w-5 h-5" />
                    选择分析对象
                  </CardTitle>
                  <CardDescription>选择要分析的联系人或群聊</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={formData.targetType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, targetType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分析范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部聊天</SelectItem>
                      <SelectItem value="specific">特定联系人</SelectItem>
                      <SelectItem value="groups">群聊</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.targetType === 'specific' && (
                    <div className="space-y-4">
                      {/* 已选择的联系人标签展示 */}
                      {formData.selectedContacts.length > 0 && (
                        <div>
                          <Label className="block mb-2 text-sm font-medium">
                            已选择 ({formData.selectedContacts.length})
                          </Label>
                          <div className="flex flex-wrap gap-2 p-3 overflow-y-auto rounded-lg bg-gray-50 max-h-32">
                            {formData.selectedContacts.map((contactId) => {
                              const contact = getContactById(contactId)
                              return contact ? (
                                <Badge
                                  key={contactId}
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1"
                                >
                                  {contact.type === 'group' ? (
                                    <UsersIcon className="w-3 h-3" />
                                  ) : (
                                    <UserPlus className="w-3 h-3" />
                                  )}
                                  {contact.name}
                                  <X
                                    className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                                    onClick={() => handleContactToggle(contactId)}
                                  />
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}

                      {/* 批量操作按钮 */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="text-xs"
                        >
                          全选
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearAll}
                          className="text-xs"
                        >
                          清空
                        </Button>
                      </div>

                      {/* 联系人搜索和选择 */}
                      <div>
                        <Label className="block mb-2 text-sm font-medium">搜索并选择联系人</Label>
                        <Command className="border rounded-lg">
                          <CommandInput placeholder="搜索联系人或群聊..." />
                          <CommandList className="max-h-64">
                            <CommandEmpty>未找到相关联系人</CommandEmpty>

                            <CommandGroup heading="个人联系人">
                              {personalContacts.slice(0, 100).map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  onSelect={() => handleContactToggle(contact.id)}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    <span>{contact.name}</span>
                                  </div>
                                  {formData.selectedContacts.includes(contact.id) && (
                                    <Badge variant="default" className="text-xs">
                                      已选择
                                    </Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>

                            <CommandGroup heading="群聊">
                              {groupChats.slice(0, 50).map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  onSelect={() => handleContactToggle(contact.id)}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4" />
                                    <div className="flex flex-col">
                                      <span>{contact.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {contact.memberCount} 人
                                      </span>
                                    </div>
                                  </div>
                                  {formData.selectedContacts.includes(contact.id) && (
                                    <Badge variant="default" className="text-xs">
                                      已选择
                                    </Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <MessageSquare className="w-5 h-5" />
                    选择分析类型
                  </CardTitle>
                  <CardDescription>选择分析类型</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {analysisTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`px-4 py-2 rounded-full border-2 transition-all font-medium text-sm ${
                          formData.analysisType === type.value
                            ? 'border-purple-400 bg-purple-100 text-purple-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50'
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, analysisType: type.value }))
                        }
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {formData.analysisType === 'custom' && (
                    <div>
                      <Label htmlFor="customPrompt">自定义提示词</Label>
                      <Textarea
                        id="customPrompt"
                        placeholder="请输入你的自定义分析提示词..."
                        value={formData.customPrompt}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, customPrompt: e.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Button
                type="submit"
                disabled={isGenerating || !formData.timeRange || !formData.analysisType}
                className="w-full h-12 max-w-md text-lg text-white shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                    正在生成报告...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    生成分析报告
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default GenerateReport
