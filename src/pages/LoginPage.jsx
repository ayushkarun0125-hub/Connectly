import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import TravelConnectSignIn from '../components/ui/travel-connect-signin-1'
import { useAuth } from '../contexts/useAuth'

function LoginPage() {
  const { loading: authLoading, isSignedIn, user, login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-transparent text-slate-100">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (isSignedIn) {
    const dest = user?.profileCompleted === false ? '/app/profile/setup' : '/app'
    return <Navigate to={dest} replace />
  }

  async function handleEmailSignIn({ email, password }) {
    setLoading(true)
    setErrorMessage('')
    try {
      const u = await login(email, password)
      navigate(u?.profileCompleted === false ? '/app/profile/setup' : '/app', { replace: true })
    } catch (error) {
      setErrorMessage(error?.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignIn() {
    setErrorMessage('Google OAuth is disabled in JWT mode. Use email/password.')
  }

  return (
    <TravelConnectSignIn
      onSubmit={handleEmailSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onForgotPassword={() => navigate('/forgot-password')}
      loading={loading}
      errorMessage={errorMessage}
    />
  )
}

export default LoginPage
