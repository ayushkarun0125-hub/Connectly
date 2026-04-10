import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import TravelConnectSignup from '../components/ui/travel-connect-signup-1'

function SignupPage() {
  const { loading, isSignedIn, user, signup } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
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

  async function handleSubmit({ displayName, email, password }) {
    setSubmitting(true)
    setError('')
    try {
      await signup({ displayName, email, password })
      navigate('/app/profile/setup', { replace: true })
    } catch (err) {
      setError(err?.message || 'Sign-up failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TravelConnectSignup
      onSubmit={handleSubmit}
      onNavigateLogin={() => navigate('/login')}
      loading={submitting}
      errorMessage={error}
    />
  )
}

export default SignupPage
