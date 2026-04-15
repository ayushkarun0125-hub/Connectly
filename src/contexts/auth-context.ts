import { createContext } from 'react'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: string
  bio?: string
  profileCompleted?: boolean
}

export type AuthContextValue = {
  loading: boolean
  isSignedIn: boolean
  user: AuthUser | null
  token: string
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (args: { displayName: string; email: string; password: string }) => Promise<AuthUser>
  updateProfile: (args: { displayName: string; bio: string }) => Promise<AuthUser>
  logout: () => void
  parseError: (err: unknown, fallback: string) => string
}

export const AuthContext = createContext<AuthContextValue | null>(null)
