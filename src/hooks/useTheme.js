import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const rawStored = localStorage.getItem('connectly-theme')
    if (rawStored !== 'light' && rawStored !== 'dark') {
      setTheme(media.matches ? 'dark' : 'light')
    }
    const onChange = (event) => {
      const explicit = localStorage.getItem('connectly-theme')
      if (explicit === 'light' || explicit === 'dark') return
      setTheme(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [setTheme])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  }
}
