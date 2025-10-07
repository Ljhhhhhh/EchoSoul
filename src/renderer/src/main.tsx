import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeTheme } from './hooks/useTheme'

// 在应用渲染前初始化主题，避免闪烁
initializeTheme()
  .then(() => {
    createRoot(document.getElementById('root')!).render(<App />)
  })
  .catch((error) => {
    console.error('Failed to initialize theme, rendering app anyway:', error)
    createRoot(document.getElementById('root')!).render(<App />)
  })
