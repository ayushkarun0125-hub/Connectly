import { create } from 'zustand'

const STORAGE_KEY = 'connectly-auth'
const THEME_KEY = 'connectly-theme'

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const initialAuth = readStoredAuth()

function readStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

export const useAppStore = create((set) => ({
  auth: initialAuth || { token: null, user: null },
  theme: readStoredTheme(),
  toasts: [],
  setAuth: (auth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    set({ auth })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ auth: { token: null, user: null } })
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      return { theme: next }
    })
  },
  setTheme: (theme) => {
    const next = theme === 'light' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    set({ theme: next })
  },
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))
