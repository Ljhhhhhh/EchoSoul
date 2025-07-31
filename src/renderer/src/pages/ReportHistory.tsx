import React, { useState } from 'react'
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
import { reports } from '../data/reports'

const ReportHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || report.analysisType === filterType
    return matchesSearch && matchesFilter
  })

  const analysisTypeColors: Record<string, string> = {
    情感分析: 'bg-pink-100 text-pink-700',
    人格分析: 'bg-purple-100 text-purple-700',
    关系分析: 'bg-blue-100 text-blue-700',
    工作氛围: 'bg-green-100 text-green-700',
    情商提升: 'bg-orange-100 text-orange-700',
    思维陷阱: 'bg-red-100 text-red-700'
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-orange-100 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">历史报告</h1>
          <p className="text-sm text-gray-600">查看和管理你的所有分析报告</p>
        </div>
        <Link to="/generate">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            生成新报告
          </Button>
        </Link>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索报告..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="情感分析">情感分析</SelectItem>
                <SelectItem value="人格分析">人格分析</SelectItem>
                <SelectItem value="关系分析">关系分析</SelectItem>
                <SelectItem value="工作氛围">工作氛围</SelectItem>
                <SelectItem value="情商提升">情商提升</SelectItem>
                <SelectItem value="思维陷阱">思维陷阱</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-orange-200 bg-white hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/30 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-gray-800 line-clamp-2 flex-1">
                        {report.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
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
                      <Link to={`/report/${report.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到匹配的报告</h3>
              <p className="text-gray-500 mb-4">尝试调整搜索条件或生成新的报告</p>
              <Link to="/generate">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
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
