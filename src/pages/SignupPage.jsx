import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { postAuthDestination } from '../lib/postAuthRedirect'

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
    return <Navigate to={postAuthDestination(user)} replace />
  }

  const [form, setForm] = useState({ displayName: '', email: '', password: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signup({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      })
      navigate('/setup-profile', { replace: true })
    } catch (err) {
      setError(err?.message || 'Sign-up failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl pb-20 pt-6 md:pt-10">
      <div className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Sign Up</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Create your Connectly account</h1>
        <p className="mt-3 text-slate-400">Start with a private workspace, then invite your team.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Display name</span>
            <input
              required
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
            />
          </label>
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-300 transition hover:text-blue-200">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
