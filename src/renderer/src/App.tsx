import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import Dashboard from '@/pages/Dashboard'
import GenerateReport from '@/pages/GenerateReport'
import ReportHistory from '@/pages/ReportHistory'
import ReportDetails from '@/pages/ReportDetails'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import InitializationPage from '@/pages/InitializationPage'
import { InitializationChecker } from '@/components/InitializationChecker'
import { useInitializationStatus } from '@/hooks/useInitializationStatus'

const queryClient = new QueryClient()

// 主应用组件，处理初始化检查
function AppWithInitialization(): React.ReactElement {
  const location = useLocation()
  const { status: initializationStatus } = useInitializationStatus()

  // 如果当前在初始化页面，直接渲染路由，不显示检查界面
  if (location.pathname === '/initialization') {
    return (
      <Routes>
        <Route path="/initialization" element={<InitializationPage />} />
      </Routes>
    )
  }

  // 如果正在检查或需要初始化，显示全屏界面
  if (initializationStatus === 'checking' || initializationStatus === 'incomplete') {
    return <InitializationChecker status={initializationStatus} />
  }

  // 只有完成初始化才显示正常的应用界面
  return (
    <Routes>
      {/* 初始化页面 - 单页全屏展示，不带边栏 */}
      <Route path="/initialization" element={<InitializationPage />} />

      {/* 其他页面 - 带边栏的主应用布局 */}
      <Route
        path="/*"
        element={
          <SidebarProvider>
            <div className="flex w-full min-h-screen">
              <AppSidebar />
              <SidebarInset className="flex-1 w-full min-w-0">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/generate" element={<GenerateReport />} />
                  <Route path="/history" element={<ReportHistory />} />
                  <Route path="/report/:id" element={<ReportDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarInset>
            </div>
          </SidebarProvider>
        }
      />
    </Routes>
  )
}

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AppWithInitialization />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
