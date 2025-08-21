import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'

import {
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { reports } from '../data/reports'
import { toast } from 'sonner'

const Dashboard = (): React.ReactElement => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isStartingService, setIsStartingService] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string | undefined>(undefined)
  const recentReports = reports.slice(0, 3)
  const totalReports = reports.length
  const totalMessages = reports.reduce((sum, report) => sum + report.messageCount, 0)

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

  // 组件挂载时检查并启动服务
  useEffect(() => {
    // 延迟一点时间确保应用完全加载
    const timer = setTimeout(() => {
      checkAndStartChatlogService()
      fetchLastUpdateTime()
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
        // 更新成功后重新获取上次更新时间
        await fetchLastUpdateTime()
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
      <header className="flex sticky top-0 z-10 gap-4 items-center px-6 py-4 border-b border-orange-100 backdrop-blur-sm bg-white/80">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-sm text-gray-600">让AI帮你发现聊天中的深层洞察</p>
        </div>
        <div className="flex gap-4 items-center">
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
            className="flex flex-col items-center py-3 h-auto text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <div className="flex gap-2 items-center">
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
          </Button>
        </div>
        {/* <Button
          onClick={handleUpdateData}
          disabled={isUpdating || isStartingService}
          variant="outline"
          size="sm"
          className="flex flex-col items-center py-3 h-auto text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          <div className="flex gap-2 items-center">
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? '更新中...' : '更新数据'}</span>
          </div>
          {lastUpdateTime && (
            <div className="flex gap-1 items-center mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(lastUpdateTime).toLocaleString('zh-CN')}</span>
            </div>
          )}
        </Button> */}
      </header>

      <main className="overflow-auto flex-1 p-6">
        <div className="mx-auto space-y-8 max-w-7xl">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <Card className="bg-gradient-to-br border-orange-200 transition-all duration-300 from-orange-100/50 to-amber-100/50 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center text-orange-800">
                  <Sparkles className="w-5 h-5" />
                  生成新报告
                </CardTitle>
                <CardDescription className="text-orange-700/80">
                  分析你的微信聊天记录，获得个性化洞察
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/generate">
                  <Button className="w-full text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg hover:from-orange-600 hover:to-amber-600">
                    开始分析
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br border-blue-200 transition-all duration-300 from-blue-100/50 to-indigo-100/50 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center text-blue-800">
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
            <Card className="bg-gradient-to-br border-green-200 from-green-100/50 to-emerald-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex gap-2 items-center text-sm font-medium text-green-800">
                  <TrendingUp className="w-4 h-4" />
                  总报告数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{totalReports}</div>
                <p className="text-xs text-green-700/80">已生成的分析报告</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br border-purple-200 from-purple-100/50 to-pink-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex gap-2 items-center text-sm font-medium text-purple-800">
                  <MessageCircle className="w-4 h-4" />
                  分析消息数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {totalMessages.toLocaleString()}
                </div>
                <p className="text-xs text-purple-700/80">已分析的聊天消息</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br border-teal-200 from-teal-100/50 to-cyan-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex gap-2 items-center text-sm font-medium text-teal-800">
                  <Users className="w-4 h-4" />
                  活跃联系人
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">12</div>
                <p className="text-xs text-teal-700/80">经常聊天的联系人</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
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
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link to={`/report/${report.id}`}>
                    <Card className="bg-white border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-orange-200 hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/30">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 line-clamp-1">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="flex gap-4 items-center text-sm">
                          <span className="flex gap-1 items-center">
                            <Clock className="w-3 h-3" />
                            {report.createdAt}
                          </span>
                          <span className="flex gap-1 items-center">
                            <MessageCircle className="w-3 h-3" />
                            {report.messageCount}条消息
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">{report.summary}</p>
                        <div className="flex gap-2 items-center mt-3">
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
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
