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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex w-full min-h-screen">
              <AppSidebar />
              <SidebarInset className="flex-1 w-full min-w-0">
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/generate" element={<GenerateReport />} />
                  <Route path="/history" element={<ReportHistory />} />
                  <Route path="/report/:id" element={<ReportDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/initialization" element={<InitializationPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
