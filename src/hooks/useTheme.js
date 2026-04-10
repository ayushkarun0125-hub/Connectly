import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useTheme() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
