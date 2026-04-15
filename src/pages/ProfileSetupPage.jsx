import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { postAuthDestination } from '../lib/postAuthRedirect'
import ActionButton from '../components/connectly/ActionButton'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'

function ProfileSetupPage() {
  const { user, loading, isSignedIn, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-transparent">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  if (user?.profileCompleted) {
    return <Navigate to={postAuthDestination(user)} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const nextUser = await updateProfile({ displayName: displayName.trim(), bio: bio.trim() })
      navigate(postAuthDestination(nextUser), { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-transparent px-4 py-12">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="mb-8 inline-block text-lg font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Connectly
        </Link>
        <ConnectlyPanel>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Finish your profile</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Choose how your name appears in rooms and add a short bio so teammates recognize you.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Display name
              </span>
              <input
                required
                maxLength={80}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/[0.1] dark:bg-[#07111f] dark:text-slate-100 dark:focus:border-blue-500/50"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Bio (optional)
              </span>
              <textarea
                maxLength={500}
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Role, team, or what you’re working on…"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/[0.1] dark:bg-[#07111f] dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-blue-500/50"
              />
            </label>
            {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
            <ActionButton variant="primary" className="w-full" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Continue to Connectly'}
            </ActionButton>
          </form>
        </ConnectlyPanel>
      </div>
    </div>
  )
}

export default ProfileSetupPage
