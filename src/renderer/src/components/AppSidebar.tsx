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
    chatlogService: 'connected' // connected | disconnected | error
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

        {/* 系统状态与控制区域 - 简约设计 */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div className="px-3 pb-4 space-y-4">
              {/* Chatlog 服务状态 - 极简设计 */}
              <div className="relative p-3 transition-all duration-200 border rounded-lg group/status border-slate-200/80 bg-white/60 hover:bg-white/80 hover:border-slate-300/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          systemStatus.chatlogService === 'connected'
                            ? 'bg-emerald-500'
                            : systemStatus.chatlogService === 'error'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                        }`}
                      ></div>
                      {systemStatus.chatlogService === 'connected' && (
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500/30 animate-ping"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">Chatlog 服务</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {getStatusText(systemStatus.chatlogService)}
                  </span>
                </div>
              </div>

              {/* 简约分隔线 */}
              <div className="h-px bg-slate-200/60"></div>

              {/* 退出应用 - 简约设计 */}
              <button
                onClick={handleQuitApp}
                className="group/exit relative w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-200/80 bg-white/60 transition-all duration-200 hover:bg-red-50/80 hover:border-red-200/80 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-200/50"
              >
                {/* 图标 */}
                <div className="flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-md bg-slate-100 group-hover/exit:bg-red-100">
                  <LogOut className="w-4 h-4 transition-colors duration-200 text-slate-600 group-hover/exit:text-red-600" />
                </div>

                {/* 文字内容 */}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium transition-colors duration-200 text-slate-700 group-hover/exit:text-red-700">
                    退出应用
                  </div>
                  <div className="text-xs transition-colors duration-200 text-slate-500 group-hover/exit:text-red-500">
                    关闭 EchoSoul
                  </div>
                </div>

                {/* 状态指示 */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/exit:bg-red-400 transition-colors duration-200"></div>
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
