import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Mail, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import Badge from '../components/ui/Badge'
import { useAuth } from '../contexts/useAuth'
import ActionButton from '../components/connectly/ActionButton'

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

function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const role = user?.role ?? 'user'
  const name = user?.displayName || user?.email || 'User'
  const email = user?.email || ''
  const bio = user?.bio || ''
  const username = user?.username || ''
  const interest = user?.interest || ''
  const joinedLabel = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'
  const avatarUrl = user?.avatarUrl || ''
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draft, setDraft] = useState({
    displayName: '',
    username: '',
    bio: '',
    interest: '',
    avatarData: '',
    avatarMimeType: 'image/png',
    avatarPreview: '',
  })

  useEffect(() => {
    if (!user) return
    setDraft({
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || '',
      interest: user.interest || '',
      avatarData: '',
      avatarMimeType: 'image/png',
      avatarPreview: user.avatarUrl || '',
    })
  }, [user])

  const normalizedUsername = useMemo(
    () =>
      String(draft.username || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, ''),
    [draft.username],
  )
  const canSave = String(draft.displayName || '').trim().length >= 2 && normalizedUsername.length >= 3 && !busy

  async function handlePickAvatar(event) {
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
    const encoded = await toBase64(file)
    setError('')
    setDraft((prev) => ({
      ...prev,
      avatarData: encoded,
      avatarMimeType: file.type || 'image/png',
      avatarPreview: URL.createObjectURL(file),
    }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!canSave) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile({
        displayName: draft.displayName.trim(),
        username: normalizedUsername,
        bio: draft.bio.trim(),
        interest: draft.interest,
        avatarData: draft.avatarData || undefined,
        avatarMimeType: draft.avatarMimeType || undefined,
      })
      setEditing(false)
      setSuccess('Profile updated successfully.')
      setTimeout(() => setSuccess(''), 2200)
    } catch (err) {
      setError(err?.message || 'Could not update profile')
    } finally {
      setBusy(false)
    }
  }

  function resetDraft() {
    if (!user) return
    setDraft({
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || '',
      interest: user.interest || '',
      avatarData: '',
      avatarMimeType: 'image/png',
      avatarPreview: user.avatarUrl || '',
    })
    setError('')
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your account details and workspace role."
        action={(
          <div className="flex items-center gap-2">
            {!editing ? (
              <ActionButton variant="primary" size="sm" onClick={() => setEditing(true)}>
                Edit profile
              </ActionButton>
            ) : null}
            <Link
              to="/app/team"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View team directory →
            </Link>
          </div>
        )}
      />

      <ConnectlyPanel className="max-w-4xl overflow-hidden !p-0">
        {loading || !user ? (
          <div className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile…</p>
          </div>
        ) : (
          <>
            <div className="relative border-b border-slate-200/70 bg-gradient-to-br from-white to-slate-50/70 p-6 dark:border-white/[0.06] dark:from-[#0d1729] dark:to-[#0a1322]">
              <div className="pointer-events-none absolute right-5 top-5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-300">
                Profile completeness: {bio || username ? 'High' : 'Basic'}
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg shadow-blue-600/25">
                  {draft.avatarPreview ? (
                    <img src={draft.avatarPreview} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold text-slate-900 dark:text-white">{name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {email}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Joined {joinedLabel}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge color="blue" className="!uppercase !tracking-wide">
                      {role}
                    </Badge>
                    {username ? (
                      <Badge color="slate" className="!font-medium">
                        @{username}
                      </Badge>
                    ) : null}
                    {interest ? (
                      <Badge color="emerald" className="!font-medium">
                        {interest}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {editing ? (
                  <label className="inline-flex h-fit cursor-pointer items-center gap-2 rounded-xl border border-white/[0.14] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
                    Change avatar
                    <input type="file" accept="image/*" className="hidden" onChange={handlePickAvatar} />
                  </label>
                ) : null}
              </div>
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">Display name *</span>
                      <input
                        value={draft.displayName}
                        onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
                        className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">Username *</span>
                      <input
                        value={draft.username}
                        onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
                        className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                      />
                      <p className="mt-1 text-xs text-slate-500">Will be saved as @{normalizedUsername || 'username'}</p>
                    </label>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">Role / interest</span>
                      <select
                        value={draft.interest}
                        onChange={(e) => setDraft((prev) => ({ ...prev, interest: e.target.value }))}
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
                        rows={3}
                        maxLength={500}
                        value={draft.bio}
                        onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                        className="w-full resize-none rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                      />
                    </label>
                  </div>
                  {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <ActionButton variant="ghost" size="sm" type="button" onClick={resetDraft} disabled={busy}>
                      Cancel
                    </ActionButton>
                    <ActionButton variant="primary" size="sm" type="submit" disabled={!canSave}>
                      {busy ? 'Saving…' : 'Save changes'}
                    </ActionButton>
                  </div>
                </form>
              ) : null}
              {success ? <p className="mb-4 text-sm text-emerald-300">{success}</p> : null}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                    Identity
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {username ? `@${username}` : 'No handle set'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                    {role === 'admin' ? 'Administrator' : role === 'moderator' ? 'Moderator' : 'Member'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Profile is active and verified.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                    Focus
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{interest || 'General'}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Customize this in setup profile.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    Account
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
                    You are signed in with Connectly&apos;s secure session. Password and security settings are managed
                    in Settings. Keep your profile details current for better team visibility.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Role access
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
                    Admins use the Admin portal, moderators use the Moderator portal, and members get the core
                    collaboration workspace.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-5 dark:border-white/[0.08] dark:bg-[#0c1628]/60">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <UserCircle2 className="h-4 w-4 text-blue-500" />
                  Bio
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {bio || 'Add a short intro in profile setup so teammates know what you are working on.'}
                </p>
              </div>
            </div>
          </>
        )}
      </ConnectlyPanel>
    </div>
  )
}

export default ProfilePage
