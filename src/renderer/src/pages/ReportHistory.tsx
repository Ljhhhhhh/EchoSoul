import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import ReportCard from '@/components/ReportCard'
import { Search, Filter, Clock } from 'lucide-react'
import { ReportMeta, PromptTemplate } from '@types'
import { promptService } from '@/services/promptService'

const ReportHistory = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [reports, setReports] = useState<ReportMeta[]>([])
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
        setReports(reportList)
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

  const filteredReports = reports.filter((reportMeta) => {
    const matchesSearch =
      reportMeta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reportMeta.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterType === 'all' || (reportMeta.metadata?.prompt?.name || '未知分析') === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-border backdrop-blur-sm bg-card/80">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">历史报告</h1>
          <p className="text-sm text-muted-foreground">查看和管理你的所有分析报告</p>
        </div>
        <Link to="/generate">
          <Button>生成新报告</Button>
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
              <Search className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="搜索报告..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-36">
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
              <div className="mb-4 text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto animate-spin" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">正在加载报告...</h3>
              <p className="text-muted-foreground">请稍候</p>
            </motion.div>
          )}

          {/* Reports Grid */}
          {!loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((reportMeta, index) => (
                <ReportCard
                  key={reportMeta.id}
                  reportMeta={reportMeta}
                  index={index}
                  showActions={true}
                  onDownload={(report) => {
                    console.log('下载报告:', report.id)
                    // TODO: 实现下载功能
                  }}
                />
              ))}
            </div>
          )}

          {!loading && filteredReports.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="mb-4 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">没有找到匹配的报告</h3>
              <p className="mb-4 text-muted-foreground">尝试调整搜索条件或生成新的报告</p>
              <Link to="/generate">
                <Button>生成新报告</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ReportHistory
