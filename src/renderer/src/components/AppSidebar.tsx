import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from '@/components/ui/sidebar'
import { Heart, Home, FileText, History, Settings, Sparkles } from 'lucide-react'

export function AppSidebar() {
  const location = useLocation()

  const menuItems = [
    { title: '仪表盘', icon: Home, href: '/' },
    { title: '生成报告', icon: Sparkles, href: '/generate' },
    { title: '历史报告', icon: History, href: '/history' },
    { title: '设置', icon: Settings, href: '/settings' }
  ]

  return (
    <Sidebar className="border-r border-orange-100">
      <SidebarHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg">
            <Heart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              EchoSoul
            </h1>
            <p className="text-xs text-orange-600/70">AI 聊天洞察</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-orange-50/50 to-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-700/80 font-medium">主要功能</SidebarGroupLabel>
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
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
