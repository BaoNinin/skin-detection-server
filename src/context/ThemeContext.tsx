import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Taro from '@tarojs/taro'

type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 从本地存储读取主题设置
    const savedTheme = Taro.getStorageSync('themeMode') as ThemeMode
    if (savedTheme) {
      setThemeModeState(savedTheme)
    }

    // 检测系统主题
    const systemDark = Taro.getSystemInfoSync().theme === 'dark'
    updateDarkMode(savedTheme || 'light', systemDark)
  }, [])

  const updateDarkMode = (mode: ThemeMode, systemDark: boolean) => {
    const dark = mode === 'dark' || (mode === 'auto' && systemDark)
    setIsDark(dark)

    // 更新页面背景色
    if (dark) {
      // 深色模式
      Taro.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1F2937'
      })

      // 尝试设置全局样式（H5 端）
      if (typeof window !== 'undefined' && window.document) {
        document.body.classList.add('dark')
      }
    } else {
      // 浅色模式
      Taro.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#E8B4BC'
      })

      // 尝试设置全局样式（H5 端）
      if (typeof window !== 'undefined' && window.document) {
        document.body.classList.remove('dark')
      }
    }
  }

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
    Taro.setStorageSync('themeMode', mode)

    const systemDark = Taro.getSystemInfoSync().theme === 'dark'
    updateDarkMode(mode, systemDark)
  }

  const toggleTheme = () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark'
    setThemeMode(newMode)
  }

  // 监听系统主题变化
  useEffect(() => {
    if (themeMode === 'auto') {
      const handleThemeChange = (res: any) => {
        const systemDark = res.theme === 'dark'
        updateDarkMode('auto', systemDark)
      }

      Taro.onThemeChange(handleThemeChange)

      return () => {
        Taro.offThemeChange(handleThemeChange)
      }
    }
  }, [themeMode])

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
