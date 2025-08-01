import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, TrendingUp, Users, MessageCircle, Clock } from 'lucide-react'
import { reports } from '../data/reports'

const Dashboard = (): React.ReactElement => {
  const recentReports = reports.slice(0, 3)
  const totalReports = reports.length
  const totalMessages = reports.reduce((sum, report) => sum + report.messageCount, 0)

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-orange-50/30 to-amber-50/30">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-sm text-gray-600">让AI帮你发现聊天中的深层洞察</p>
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
                <p className="text-xs text-green-700/80">已生成的分析报告</p>
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
                <div className="text-2xl font-bold text-purple-900">
                  {totalMessages.toLocaleString()}
                </div>
                <p className="text-xs text-purple-700/80">已分析的聊天消息</p>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-gradient-to-br from-teal-100/50 to-cyan-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-teal-800">
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
              {recentReports.map((report, index) => (
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
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
