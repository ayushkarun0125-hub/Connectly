import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CheckCircle2, ImagePlus, UserCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { postAuthDestination } from '../lib/postAuthRedirect'
import ActionButton from '../components/connectly/ActionButton'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'

const INTEREST_OPTIONS = [
  'Design',
  'Engineering',
  'Product',
  'Marketing',
  'Operations',
  'Customer Success',
]

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(new Error('Could not read avatar file'))
    reader.readAsDataURL(file)
  })
}

function ProfileSetupPage() {
  const { user, loading, isSignedIn, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [interest, setInterest] = useState(user?.interest || '')
  const [avatarData, setAvatarData] = useState('')
  const [avatarMimeType, setAvatarMimeType] = useState('image/png')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const normalizedUsername = useMemo(
    () =>
      String(username || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, ''),
    [username],
  )
  const displayNameTrimmed = String(displayName || '').trim()
  const canSubmit = displayNameTrimmed.length >= 2 && normalizedUsername.length >= 3 && !busy

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
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      const nextUser = await updateProfile({
        displayName: displayNameTrimmed,
        username: normalizedUsername,
        bio: bio.trim(),
        interest,
        avatarData,
        avatarMimeType,
      })
      setSuccess(true)
      setTimeout(() => navigate(postAuthDestination(nextUser), { replace: true }), 700)
    } catch (err) {
      setError(err?.message || 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  async function onPickAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/^image\//.test(file.type)) {
      setError('Avatar must be an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar must be 2MB or smaller')
      return
    }
    setError('')
    const encoded = await toBase64(file)
    setAvatarData(encoded)
    setAvatarMimeType(file.type || 'image/png')
    setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <div className="min-h-dvh bg-transparent px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-block text-lg font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Connectly
        </Link>
        <ConnectlyPanel className="border-white/[0.1] bg-gradient-to-br from-[#0d1729] to-[#081222] p-0">
          <div className="grid md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="border-b border-white/[0.08] p-6 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Onboarding</p>
              <h1 className="mt-2 text-xl font-semibold text-white">Set up your profile</h1>
              <p className="mt-2 text-sm text-slate-400">
                Complete this once to unlock your private Connectly workspace.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-400">
                <p>1. Pick your display identity</p>
                <p>2. Add profile details</p>
                <p>3. Launch into your personal space</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0f1b33]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.12] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.05]">
                  <ImagePlus className="h-4 w-4" />
                  Upload avatar
                  <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">Display name *</span>
                <input
                  required
                  maxLength={80}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How people see you in chat"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">Username *</span>
                <input
                  required
                  maxLength={32}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.handle"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lowercase letters, numbers, dot, underscore, dash. Used for mentions.
                </p>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Role / interest</span>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                  >
                    <option value="">Select one (optional)</option>
                    {INTEREST_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Bio</span>
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short intro for teammates..."
                    className="w-full resize-none rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                  />
                </label>
              </div>

              {error ? <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p> : null}
              {success ? (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Profile saved. Launching your workspace...
                </p>
              ) : null}

              <ActionButton variant="primary" className="mt-2 w-full !py-3 text-sm" type="submit" disabled={!canSubmit}>
                {busy ? 'Saving profile…' : 'Complete setup and enter Connectly'}
              </ActionButton>
            </form>
          </div>
        </ConnectlyPanel>
      </div>
    </div>
  )
}

export default ProfileSetupPage
