import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import Dashboard from '@/pages/Dashboard'
import GenerateReport from '@/pages/GenerateReport'
import ReportHistory from '@/pages/ReportHistory'
import ReportDetails from '@/pages/ReportDetails'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import InitializationPage from '@/pages/InitializationPage'

const queryClient = new QueryClient()

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
