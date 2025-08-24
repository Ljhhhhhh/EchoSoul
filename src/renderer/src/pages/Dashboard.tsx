import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import type { Report } from '@types'

import {
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

// 适配器函数：将后端的ReportMeta转换为前端的Report格式
const adaptReportMeta = (reportMeta: any): Report => {
  return {
    id: reportMeta.id,
    title: reportMeta.title,
    summary: reportMeta.summary || '暂无摘要',
    createdAt: dayjs(reportMeta.createdAt).format('YYYY-MM-DD'),
    timeRange: reportMeta.metadata?.timeRange
      ? `${dayjs(reportMeta.metadata.timeRange.start).format('MM-DD')} 至 ${dayjs(reportMeta.metadata.timeRange.end).format('MM-DD')}`
      : '未知时间范围',
    targetType: reportMeta.metadata?.chatPartner || '未知对象',
    analysisType: reportMeta.metadata?.prompt?.name || '未知分析',
    messageCount: reportMeta.metadata?.messageCount || 0
  }
}

const Dashboard = (): React.ReactElement => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isStartingService, setIsStartingService] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string | undefined>(undefined)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const recentReports = reports.slice(0, 3)
  const totalReports = reports.length
  const totalMessages = reports.reduce((sum, report) => sum + report.messageCount, 0)
  const uniqueTargets = [...new Set(reports.map((report) => report.targetType))].length

  // 加载报告数据
  const loadReports = async () => {
    try {
      setLoading(true)
      const reportList = await window.api.report.getReports()
      const adaptedReports = reportList.map(adaptReportMeta)
      setReports(adaptedReports)
    } catch (error) {
      console.error('Failed to load reports:', error)
      toast.error('加载报告失败', {
        description: '无法获取报告列表，请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  // 获取上次更新时间
  const fetchLastUpdateTime = async () => {
    try {
      const time = await window.api.chatlog.getLastUpdateTime()
      setLastUpdateTime(time)
    } catch (error) {
      console.error('获取上次更新时间失败:', error)
    }
  }

  // 检查并自动启动chatlog服务
  const checkAndStartChatlogService = async () => {
    try {
      // 首先检查服务状态
      const status = await window.api.chatlog.status()
      if (status === 'running') {
        console.log('Chatlog服务已在运行')
        return
      }

      // 检查初始化状态
      const initStatus = await window.api.chatlog.checkInitialization()
      const { keyObtained, databaseDecrypted, canStartServer } = initStatus

      // 只有在可以启动服务时才启动
      if (canStartServer) {
        console.log('检测到可以启动chatlog服务，正在启动...')
        setIsStartingService(true)

        const startResult = await window.api.chatlog.start()
        if (startResult) {
          toast.success('Chatlog服务启动成功', {
            description: '现在可以正常使用聊天记录分析功能'
          })
          console.log('Chatlog服务启动成功')
        } else {
          toast.error('Chatlog服务启动失败', {
            description: '请检查配置或手动重试'
          })
          console.error('Chatlog服务启动失败')
        }
      } else if (!keyObtained || !databaseDecrypted) {
        console.log('初始化未完成，跳过自动启动服务')
      } else {
        console.log('Chatlog服务已在运行')
      }
    } catch (error) {
      console.error('检查chatlog服务状态失败:', error)
    } finally {
      setIsStartingService(false)
    }
  }

  // 组件挂载时检查并启动服务，同时加载报告数据
  useEffect(() => {
    // 延迟一点时间确保应用完全加载
    const timer = setTimeout(() => {
      checkAndStartChatlogService()
      fetchLastUpdateTime()
      loadReports()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 更新数据函数
  const handleUpdateData = async () => {
    setIsUpdating(true)
    try {
      const result = await window.api.chatlog.decryptDatabase()
      if (result.success) {
        toast.success('数据更新成功', {
          description: '微信聊天记录已成功解密并更新'
        })
        // 更新成功后重新获取上次更新时间和报告数据
        await fetchLastUpdateTime()
        await loadReports()
      } else {
        toast.error('数据更新失败', {
          description: result.message || '解密数据库时发生错误'
        })
      }
    } catch (error) {
      console.error('更新数据失败:', error)
      toast.error('数据更新失败', {
        description: '发生未知错误，请稍后重试'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-sm text-gray-600">让AI帮你发现聊天中的深层洞察</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdateTime && (
            <span>
              上次同步:{' '}
              {lastUpdateTime ? dayjs(lastUpdateTime).format('YYYY-MM-DD HH:mm') : '未同步'}
            </span>
          )}
          <Button
            onClick={handleUpdateData}
            disabled={isUpdating || isStartingService}
            variant="link"
            size="sm"
            className="flex flex-col items-center h-auto py-3 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto space-y-8 max-w-7xl">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <Card className="transition-all duration-300 border-orange-200 bg-gradient-to-br from-orange-100/50 to-amber-100/50 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Sparkles className="w-5 h-5" />
                  生成新报告
                </CardTitle>
                <CardDescription className="text-orange-700/80">
                  分析你的微信聊天记录，获得个性化洞察
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/generate">
                  <Button className="w-full text-white shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    开始分析
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="w-5 h-5" />
                  查看历史报告
                </CardTitle>
                <CardDescription className="text-blue-700/80">
                  回顾之前的分析结果，追踪你的成长轨迹
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/history">
                  <Button
                    variant="outline"
                    className="w-full text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    查看历史
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-100/50 to-emerald-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <TrendingUp className="w-4 h-4" />
                  总报告数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{totalReports}</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-100/50 to-pink-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-800">
                  <MessageCircle className="w-4 h-4" />
                  分析消息数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{totalMessages}</div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-gradient-to-br from-teal-100/50 to-cyan-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-teal-800">
                  <Users className="w-4 h-4" />
                  已分析聊天对象
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">{uniqueTargets}</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">最近的报告</h2>
              <Link to="/history">
                <Button
                  variant="ghost"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  查看全部
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                // 加载状态
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="transition-all duration-300 bg-white border-gray-200">
                      <CardHeader>
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex gap-4">
                          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : recentReports.length > 0 ? (
                // 有报告数据
                recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link to={`/report/${report.id}`}>
                      <Card className="transition-all duration-300 bg-white border-gray-200 hover:shadow-lg hover:border-orange-200 hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/30">
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-800 line-clamp-1">
                            {report.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {report.createdAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {report.messageCount}条消息
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">{report.summary}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded-full">
                              {report.analysisType}
                            </span>
                            <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">
                              {report.targetType}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // 空状态
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-full"
                >
                  <Card className="transition-all duration-300 bg-white border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="w-12 h-12 mb-4 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-600">暂无报告</h3>
                      <p className="mb-4 text-sm text-center text-gray-500">
                        还没有生成过任何分析报告，开始分析你的聊天记录吧！
                      </p>
                      <Link to="/generate">
                        <Button className="text-white shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                          开始分析
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
