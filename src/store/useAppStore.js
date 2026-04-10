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
  /** App is dark-only; kept for compatibility with hooks that read `theme`. */
  theme: 'dark',
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
    localStorage.setItem('connectly-theme', 'dark')
    set({ theme: 'dark' })
  },
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))
