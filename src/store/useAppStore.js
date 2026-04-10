import { create } from 'zustand'

const STORAGE_KEY = 'connectly-auth'

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const initialAuth = readStoredAuth()

export const useAppStore = create((set) => ({
  auth: initialAuth || { token: null, user: null },
  theme: localStorage.getItem('connectly-theme') || 'dark',
  toasts: [],
  setAuth: (auth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    set({ auth })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ auth: { token: null, user: null } })
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('connectly-theme', next)
      return { theme: next }
    }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))
