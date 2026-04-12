import { useEffect, useState } from 'react'
import { Wrench } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { adminApi } from '@/services/adminApi'
import { StatusBadge } from '@/components/admin/StatusBadge'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [s, setS] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setS)
      .catch((e) => setErr(e.message))
  }, [])

  async function save(partial) {
    if (!isAdmin) return
    try {
      const next = { ...s, ...partial }
      const out = await adminApi.putSettings(next)
      setS(out)
    } catch (e) {
      setErr(e.message)
    }
  }

  if (!s) return <p className="text-slate-500">Loading…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-sky-400">
          <Wrench className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Platform settings</h1>
          <p className="mt-1 text-sm text-slate-500">Persisted in server data/admin-settings.json. Admin-only writes.</p>
        </div>
      </div>

      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      {!isAdmin ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">Read-only for moderators.</div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white">Uploads</h2>
        <label className="block text-xs text-slate-500">
          Max upload size (MB)
          <input
            type="number"
            disabled={!isAdmin}
            value={s.uploadLimitMB}
            onChange={(e) => setS({ ...s, uploadLimitMB: Number(e.target.value) })}
            onBlur={() => save({ uploadLimitMB: s.uploadLimitMB })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-slate-500">
          Allowed file types (description)
          <input
            disabled={!isAdmin}
            value={s.allowedFileTypes}
            onChange={(e) => setS({ ...s, allowedFileTypes: e.target.value })}
            onBlur={() => save({ allowedFileTypes: s.allowedFileTypes })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-white"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white">Rooms and moderation</h2>
        <label className="block text-xs text-slate-500">
          Default room rules (shown in policy UI)
          <textarea
            disabled={!isAdmin}
            value={s.roomRules}
            onChange={(e) => setS({ ...s, roomRules: e.target.value })}
            onBlur={() => save({ roomRules: s.roomRules })}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-slate-500">
          Default moderation action
          <select
            disabled={!isAdmin}
            value={s.moderationDefaultAction}
            onChange={(e) => {
              const moderationDefaultAction = e.target.value
              setS({ ...s, moderationDefaultAction })
              save({ moderationDefaultAction })
            }}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-white"
          >
            <option value="flag">flag</option>
            <option value="hide">hide</option>
            <option value="delete">delete</option>
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white">Notifications and maintenance</h2>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-300">Notify admins on new report</span>
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={Boolean(s.notifyAdminsOnReport)}
            onChange={(e) => {
              const notifyAdminsOnReport = e.target.checked
              setS({ ...s, notifyAdminsOnReport })
              save({ notifyAdminsOnReport })
            }}
            className="h-4 w-4 rounded border-white/20"
          />
        </label>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">Maintenance mode</p>
            <p className="text-xs text-slate-500">When on, show banner in admin overview (client hook TBD).</p>
          </div>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => save({ maintenanceMode: !s.maintenanceMode })}
            className="shrink-0"
          >
            <StatusBadge variant={s.maintenanceMode ? 'danger' : 'success'}>
              {s.maintenanceMode ? 'ON' : 'OFF'}
            </StatusBadge>
          </button>
        </div>
      </section>
    </div>
  )
}
