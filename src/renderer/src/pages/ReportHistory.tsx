import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Clock, MessageCircle, Download, Eye } from 'lucide-react'
import { Report, PromptTemplate } from '@types'
import { promptService } from '@/services/promptService'
import dayjs from 'dayjs'

// 适配器函数：将后端的ReportMeta转换为前端的Report格式
const adaptReportMeta = (reportMeta: any): Report => {
  return {
    id: reportMeta.id,
    title: reportMeta.title,
    summary: reportMeta.metadata?.prompt?.content || '暂无摘要',
    createdAt: dayjs(reportMeta.createdAt).format('YYYY-MM-DD'),
    timeRange: reportMeta.metadata?.timeRange
      ? `${dayjs(reportMeta.metadata.timeRange.start).format('YYYY-MM-DD')} - ${dayjs(reportMeta.metadata.timeRange.end).format('YYYY-MM-DD')}`
      : '未知时间范围',
    targetType: reportMeta.metadata?.chatPartner || '未知目标',
    analysisType: reportMeta.metadata?.prompt?.name || '未知分析',
    messageCount: reportMeta.metadata?.messageCount || 0
  }
}

const ReportHistory = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [promptTypes, setPromptTypes] = useState<PromptTemplate[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 并行加载报告和提示词类型
        const [reportList, prompts] = await Promise.all([
          window.api.report.getReports(),
          promptService.getAllPrompts()
        ])

        const adaptedReports = reportList.map(adaptReportMeta)
        setReports(adaptedReports)
        setPromptTypes(prompts)
      } catch (error) {
        console.error('Failed to load data:', error)
        setReports([])
        setPromptTypes([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || report.analysisType === filterType
    return matchesSearch && matchesFilter
  })

  // 动态生成分析类型颜色映射
  const generateAnalysisTypeColors = () => {
    const colors = [
      'bg-pink-100 text-pink-700',
      'bg-purple-100 text-purple-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700',
      'bg-cyan-100 text-cyan-700',
      'bg-indigo-100 text-indigo-700',
      'bg-yellow-100 text-yellow-700',
      'bg-teal-100 text-teal-700'
    ]

    const colorMap: Record<string, string> = {}
    promptTypes.forEach((prompt, index) => {
      colorMap[prompt.name] = colors[index % colors.length]
    })

    return colorMap
  }

  const analysisTypeColors = generateAnalysisTypeColors()

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">历史报告</h1>
          <p className="text-sm text-gray-600">查看和管理你的所有分析报告</p>
        </div>
        <Link to="/generate">
          <Button className="text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
            生成新报告
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto space-y-6 max-w-7xl">
          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="搜索报告..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {promptTypes.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.name}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="mb-4 text-gray-400">
                <Clock className="w-16 h-16 mx-auto animate-spin" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-600">正在加载报告...</h3>
              <p className="text-gray-500">请稍候</p>
            </motion.div>
          )}

          {/* Reports Grid */}
          {!loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full transition-all duration-300 bg-white border-gray-200 hover:shadow-lg hover:border-orange-200 hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex-1 text-lg text-gray-800 line-clamp-2">
                          {report.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {report.messageCount}条消息
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              analysisTypeColors[report.analysisType] || 'bg-gray-100 text-gray-700'
                            }
                          >
                            {report.analysisType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.targetType}
                          </Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">{report.summary}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Link to={`/report/${report.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredReports.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="mb-4 text-gray-400">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-600">没有找到匹配的报告</h3>
              <p className="mb-4 text-gray-500">尝试调整搜索条件或生成新的报告</p>
              <Link to="/generate">
                <Button className="text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  生成新报告
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ReportHistory
