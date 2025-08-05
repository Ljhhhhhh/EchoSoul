import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from '@/components/ui/sidebar'
import { Heart, Home, History, Settings, Sparkles, LogOut } from 'lucide-react'

export function AppSidebar(): React.ReactElement {
  const location = useLocation()

  const menuItems = [
    { title: '仪表盘', icon: Home, href: '/' },
    { title: '生成报告', icon: Sparkles, href: '/generate' },
    { title: '历史报告', icon: History, href: '/history' },
    { title: '设置', icon: Settings, href: '/settings' }
  ]

  // 模拟状态数据 - 实际项目中应该从context或hooks获取
  const systemStatus = {
    chatlogService: 'connected', // connected | disconnected | error
    aiService: 'connected',
    currentAiProvider: 'OpenAI GPT-4'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'disconnected':
        return 'bg-gray-400'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '已连接'
      case 'disconnected':
        return '未连接'
      case 'error':
        return '连接错误'
      default:
        return '未知'
    }
  }

  const handleQuitApp = async () => {
    try {
      // 调用我们自定义的退出 API
      if (window.api && window.api.app) {
        await window.api.app.quit()
      } else {
        // 如果在开发环境或没有 API，关闭窗口
        window.close()
      }
    } catch (error) {
      console.error('Failed to quit application:', error)
      // 备用方案：直接关闭窗口
      window.close()
    }
  }

  return (
    <Sidebar className="border-r border-orange-100">
      <SidebarHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl">
            <Heart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text">
              EchoSoul
            </h1>
            <p className="text-xs text-orange-600/70">AI 聊天洞察</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-orange-50/50 to-white">
        {/* 主导航菜单 - 移除了冗余的"主要功能"标签 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className="hover:bg-orange-100/60 data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-200 data-[active=true]:to-amber-200 data-[active=true]:text-orange-800"
                  >
                    <Link to={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 系统状态区域 */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div className="px-3 py-3 space-y-3">
              {/* 服务状态 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Chatlog服务</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.chatlogService)}`}
                    />
                    <span className="text-xs text-gray-600">
                      {getStatusText(systemStatus.chatlogService)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">AI服务</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.aiService)}`}
                    />
                    <span className="text-xs text-gray-600">
                      {getStatusText(systemStatus.aiService)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-orange-100/50"></div>

              {/* 退出功能 - 使用与主导航相同的组件结构 */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleQuitApp}
                    className="p-0 transition-all duration-300 ease-out group/quit hover:bg-transparent"
                  >
                    <LogOut className="w-4 h-4 transition-all duration-300 ease-out group-hover/quit:scale-110 group-hover/quit:rotate-12 group-hover/quit:text-orange-600" />
                    <span className="transition-all duration-300 ease-out group-hover/quit:translate-x-1 group-hover/quit:text-orange-700 group-hover/quit:font-medium">
                      退出软件
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
