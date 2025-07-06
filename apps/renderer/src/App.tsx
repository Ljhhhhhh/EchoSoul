import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { InitializationProgress } from '@/components/InitializationProgress';

type AppState = 'checking' | 'initializing' | 'ready';

function App() {
  const [appState, setAppState] = useState<AppState>('checking');

  useEffect(() => {
    checkInitializationStatus();
  }, []);

  const checkInitializationStatus = async () => {
    try {
      // 检查是否已经完成初始化
      const state = await window.electronAPI.invoke('initialization:getState');

      if (state && state.isCompleted) {
        // 如果已经完成初始化，直接进入主应用
        setAppState('ready');
      } else {
        // 否则显示初始化页面
        setAppState('initializing');
      }
    } catch (error) {
      console.error('Failed to check initialization status:', error);
      // 出错时默认显示初始化页面
      setAppState('initializing');
    }
  };

  const handleInitializationComplete = () => {
    setAppState('ready');
  };

  // 显示加载状态
  if (appState === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在检查应用状态...</p>
        </div>
      </div>
    );
  }

  // 如果需要初始化，显示初始化页面
  if (appState === 'initializing') {
    return <InitializationProgress onComplete={handleInitializationComplete} />;
  }

  // 应用已就绪，显示主应用
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
