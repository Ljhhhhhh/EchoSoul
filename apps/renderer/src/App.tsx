import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { InitializationPage } from '@/pages/InitializationPage';
import { useInitialization } from '@/hooks/useInitialization';

function App() {
  const { state, loading, needsInitialization } = useInitialization();

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">正在检查应用状态...</p>
        </div>
      </div>
    );
  }

  // 如果需要初始化，显示初始化页面
  if (needsInitialization) {
    return (
      <InitializationPage
        onComplete={() => {
          // 初始化完成后刷新页面或重新检查状态
          window.location.reload();
        }}
      />
    );
  }

  // 正常应用界面
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
