import { useEffect } from 'react'

export function useTheme() {
  useEffect(() => {
    localStorage.setItem('connectly-theme', 'dark')
    document.documentElement.classList.add('dark')
  }, [])
}
