import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Download,
  Share2,
  Clock,
  MessageCircle,
  Users,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react'
import { reports } from '../data/reports'

const ReportDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const report = reports.find((r) => r.id === id)

  if (!report) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">报告未找到</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">抱歉，找不到该报告</p>
            <Link to="/history">
              <Button>返回历史报告</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

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
        <Button
          variant="ghost"
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 line-clamp-1">{report.title}</h1>
          <p className="text-sm text-gray-600">{report.createdAt}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Report Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-100/50 to-amber-100/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-orange-800 mb-2">{report.title}</CardTitle>
                    <CardDescription className="text-orange-700/80 text-base">
                      {report.summary}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <Badge
                    className={
                      analysisTypeColors[report.analysisType] || 'bg-gray-100 text-gray-700'
                    }
                  >
                    {report.analysisType}
                  </Badge>
                  <Badge variant="outline">{report.targetType}</Badge>
                  <div className="flex items-center gap-1 text-sm text-orange-700">
                    <Clock className="h-4 w-4" />
                    {report.timeRange}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-orange-700">
                    <MessageCircle className="h-4 w-4" />
                    {report.messageCount}条消息
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">核心洞察</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-pink-200 bg-gradient-to-br from-pink-100/50 to-rose-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-800">
                    <Heart className="h-5 w-5" />
                    情感状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-900 mb-1">积极乐观</div>
                  <p className="text-sm text-pink-700/80">整体情感倾向积极，表现出较强的正面情绪</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-100/50 to-indigo-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5" />
                    社交模式
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 mb-1">主动交流</div>
                  <p className="text-sm text-blue-700/80">在对话中表现主动，善于引导话题</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-100/50 to-emerald-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="h-5 w-5" />
                    成长趋势
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 mb-1">持续提升</div>
                  <p className="text-sm text-green-700/80">沟通能力和情商水平呈现上升趋势</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Detailed Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Brain className="h-5 w-5" />
                  详细分析
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">沟通风格分析</h3>
                    <p className="text-gray-600 leading-relaxed">
                      通过对你最近一个月的聊天记录分析，发现你在与朋友交流时表现出温暖、关怀的特质。
                      你经常主动询问朋友的近况，表现出很强的同理心。在群聊中，你往往扮演调节气氛的角色，
                      善于用幽默化解尴尬，让大家感到轻松愉快。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">情感表达特点</h3>
                    <p className="text-gray-600 leading-relaxed">
                      你的情感表达相对含蓄但真诚。在表达关心时，你更倾向于通过行动和细节来体现，
                      而不是直接的情感宣泄。这种表达方式让人感到舒适，不会给对方造成压力。
                      同时，你也善于倾听，经常给朋友提供情感支持。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">成长建议</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• 可以尝试更直接地表达自己的情感和需求，这有助于建立更深层的连接</li>
                      <li>• 在处理冲突时，可以更主动地寻求解决方案，而不是回避</li>
                      <li>• 继续保持你的同理心和关怀特质，这是你最大的优势</li>
                      <li>• 可以尝试在不同的社交场合中展现更多元化的自己</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">关键词云</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '温暖',
                        '关怀',
                        '幽默',
                        '同理心',
                        '倾听',
                        '支持',
                        '真诚',
                        '细腻',
                        '包容',
                        '积极'
                      ].map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ReportDetails
