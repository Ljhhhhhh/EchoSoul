import React, { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Calendar, Users, MessageSquare, Wand2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

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

  const timeRanges = [
    { value: 'yesterday', label: '昨天' },
    { value: 'last_week', label: '最近一周' },
    { value: 'last_month', label: '最近一个月' },
    { value: 'last_3_months', label: '最近三个月' },
    { value: 'custom', label: '自定义时间' }
  ]

  const analysisTypes = [
    { value: 'emotion', label: '情感分析', description: '分析聊天中的情感变化和情绪模式' },
    { value: 'personality', label: '人格分析', description: '深入了解你的性格特征和行为模式' },
    { value: 'relationship', label: '关系分析', description: '分析与特定联系人的互动模式' },
    { value: 'work_atmosphere', label: '工作氛围', description: '分析工作群聊的氛围和团队动态' },
    { value: 'eq_improvement', label: '情商提升', description: '发现提升情商的机会和建议' },
    { value: 'thinking_traps', label: '思维陷阱', description: '识别认知偏差和思维盲点' },
    { value: 'custom', label: '自定义分析', description: '使用自定义提示词进行分析' }
  ]

  const contacts = ['张三', '李四', '王五', '赵六', '工作群', '家庭群', '朋友群', '同学群']

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsGenerating(true)

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

  const handleContactToggle = (contact: string): void => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contact)
        ? prev.selectedContacts.filter((c) => c !== contact)
        : [...prev.selectedContacts, contact]
    }))
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
                    <div>
                      <Label className="block mb-3 text-sm font-medium">选择联系人</Label>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {contacts.map((contact) => (
                          <div key={contact} className="flex items-center space-x-2">
                            <Checkbox
                              id={contact}
                              checked={formData.selectedContacts.includes(contact)}
                              onCheckedChange={() => handleContactToggle(contact)}
                            />
                            <Label htmlFor={contact} className="text-sm">
                              {contact}
                            </Label>
                          </div>
                        ))}
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
                  <CardDescription>选择你想要的分析维度和提示词</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {analysisTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.analysisType === type.value
                            ? 'border-purple-400 bg-purple-100/50'
                            : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, analysisType: type.value }))
                        }
                      >
                        <h3 className="mb-1 font-medium text-gray-800">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
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
