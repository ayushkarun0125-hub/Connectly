import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { postAuthDestination } from '../lib/postAuthRedirect'

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
    return <Navigate to={postAuthDestination(user)} replace />
  }

  async function handleEmailSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    try {
      const u = await login(form.email, form.password)
      navigate(postAuthDestination(u), { replace: true })
    } catch (error) {
      setErrorMessage(error?.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }
  const [form, setForm] = useState({ email: '', password: '' })

  return (
    <div className="mx-auto max-w-xl pb-20 pt-6 md:pt-10">
      <div className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Login</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Welcome back</h1>
        <p className="mt-3 text-slate-400">Sign in to continue to your Connectly workspace.</p>

        <form onSubmit={handleEmailSignIn} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
            />
          </label>
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-blue-300 transition hover:text-blue-200">Forgot password?</Link>
          <Link to="/sign-up" className="text-slate-400 transition hover:text-slate-200">Create account</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
