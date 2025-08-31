import { useState, useEffect, useCallback } from 'react'
import { THEME_OPTIONS } from '../pages/Settings/constants'

export type ThemeMode =
  | 'system'
  | 'candyland'
  | 'clean-slate'
  | 'cyberpunk'
  | 'ocean-breeze'
  | 'soft-pop'
  | 'starry-night'
  | 'vercel'

interface UseThemeReturn {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

// 当前活跃的主题样式表元素
let currentThemeStylesheet: HTMLLinkElement | HTMLStyleElement | null = null

// 预导入所有主题文件
const themeImports = {
  'candyland.css': () => import('../style/candyland.css?inline'),
  'clean-slate.css': () => import('../style/clean-slate.css?inline'),
  'cyberpunk.css': () => import('../style/cyberpunk.css?inline'),
  'ocean-breeze.css': () => import('../style/ocean-breeze.css?inline'),
  'soft-pop.css': () => import('../style/soft-pop.css?inline'),
  'starry-night.css': () => import('../style/starry-night.css?inline'),
  'vercel.css': () => import('../style/vercel.css?inline')
}

// 应用主题到 DOM
const applyTheme = async (theme: ThemeMode) => {
  // 移除之前的主题样式表
  if (currentThemeStylesheet) {
    currentThemeStylesheet.remove()
    currentThemeStylesheet = null
  }

  if (theme === 'system') {
    // 跟随系统主题，不加载额外的主题文件，使用默认样式
    return
  }

  // 找到对应的主题配置
  const themeConfig = THEME_OPTIONS.find((option) => option.value === theme)
  if (themeConfig && themeConfig.file) {
    try {
      // 使用预定义的导入函数
      const themeImporter = themeImports[themeConfig.file as keyof typeof themeImports]
      if (themeImporter) {
        const themeModule = await themeImporter()

        // 创建style元素并插入CSS内容
        const style = document.createElement('style')
        style.id = 'dynamic-theme'
        // 确保主题CSS具有更高的优先级，添加到head的最后
        style.textContent = themeModule.default
        document.head.appendChild(style)

        currentThemeStylesheet = style
      } else {
        throw new Error(`Theme importer not found for ${themeConfig.file}`)
      }
    } catch (error) {
      console.error(`Failed to load theme ${themeConfig.file}:`, error)

      // 回退方案：尝试使用link标签
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/src/renderer/src/style/${themeConfig.file}`
      link.id = 'dynamic-theme'

      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to load theme: ${themeConfig.file}`))
        document.head.appendChild(link)
      })

      currentThemeStylesheet = link
    }
  }
}

export const useTheme = (): UseThemeReturn => {
  // 从 localStorage 获取保存的主题，默认跟随系统
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('echosoul-theme')
      const validThemes: ThemeMode[] = THEME_OPTIONS.map((option) => option.value) as ThemeMode[]
      if (saved && validThemes.includes(saved as ThemeMode)) {
        return saved as ThemeMode
      }
    }
    return 'system'
  })

  // 应用主题
  useEffect(() => {
    const loadTheme = async () => {
      try {
        await applyTheme(theme)
      } catch (error) {
        console.error('Failed to apply theme:', error)
        // 如果主题加载失败，回退到系统主题
        if (theme !== 'system') {
          setThemeState('system')
          localStorage.setItem('echosoul-theme', 'system')
        }
      }
    }

    loadTheme()
  }, [theme])

  // 设置主题并保存到 localStorage
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem('echosoul-theme', newTheme)
  }, [])

  return {
    theme,
    setTheme
  }
}

// 在应用启动时立即应用主题（避免闪烁）
export const initializeTheme = async () => {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem('echosoul-theme') as ThemeMode | null
  const validThemes: ThemeMode[] = THEME_OPTIONS.map((option) => option.value) as ThemeMode[]
  const theme = savedTheme && validThemes.includes(savedTheme) ? savedTheme : 'system'

  try {
    await applyTheme(theme)
  } catch (error) {
    console.error('Failed to initialize theme:', error)
    // 回退到系统主题
    await applyTheme('system')
  }
}
