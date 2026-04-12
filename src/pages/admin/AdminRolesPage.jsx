import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { adminApi } from '@/services/adminApi'

function Toggle({ label, value, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        disabled={disabled}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-sky-600' : 'bg-slate-700'} ${disabled ? 'opacity-40' : ''}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </label>
  )
}

export default function AdminRolesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [perms, setPerms] = useState(null)
  const [err, setErr] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi
      .getSettings()
      .then((x) => setPerms(x.permissions || {}))
      .catch((e) => setErr(e.message))
  }, [])

  function updateRole(role, key, val) {
    setPerms((p) => ({
      ...p,
      [role]: { ...p[role], [key]: val },
    }))
    setSaved(false)
  }

  async function save() {
    if (!isAdmin) return
    try {
      await adminApi.putSettings({ permissions: perms })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setErr(e.message)
    }
  }

  if (!perms) {
    return <p className="text-slate-500">Loading permissions</p>
  }

  const cards = [
    { role: 'user', title: 'Member', icon: User, desc: 'Default workspace accounts', color: 'from-slate-500/20 to-transparent' },
    { role: 'moderator', title: 'Moderator', icon: Users, desc: 'Trust and safety', color: 'from-amber-500/15 to-transparent' },
    { role: 'admin', title: 'Administrator', icon: Shield, desc: 'Full control plane', color: 'from-sky-500/20 to-transparent' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles and permissions</h1>
          <p className="mt-1 text-sm text-slate-500">Stored in admin-settings.json on the server.</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            {saved ? 'Saved' : 'Save changes'}
          </button>
        ) : (
          <p className="text-xs text-amber-200/80">View only for moderators.</p>
        )}
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map(({ role, title, icon: Icon, desc, color }, i) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl border border-white/10 bg-gradient-to-b ${color} p-5`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/20 text-sky-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 px-3">
              {Object.entries(perms[role] || {}).map(([key, val]) => (
                <Toggle
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={Boolean(val)}
                  onChange={(v) => updateRole(role, key, v)}
                  disabled={!isAdmin}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
