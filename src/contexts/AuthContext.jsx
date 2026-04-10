import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
const TOKEN_KEY = 'connectly_jwt'

function parseError(err, fallback) {
  return err?.message || fallback
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  async function fetchMe(currentToken) {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    })
    if (!response.ok) throw new Error('Session expired')
    const data = await response.json()
    return data.user
  }

  useEffect(() => {
    if (!token) return
    fetchMe(token)
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'Login failed')
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async ({ displayName, email, password }) => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, email, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'Signup failed')
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const updateProfile = useCallback(async ({ displayName, bio }) => {
    const current = token || localStorage.getItem(TOKEN_KEY)
    if (!current) throw new Error('Not signed in')
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${current}` },
      body: JSON.stringify({ displayName, bio }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'Update failed')
    setUser(data.user)
    return data.user
  }, [token])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      loading,
      isSignedIn: Boolean(user),
      user,
      token,
      login,
      signup,
      updateProfile,
      logout,
      parseError,
    }),
    [loading, user, token, login, signup, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
