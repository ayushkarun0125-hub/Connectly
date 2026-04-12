import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { FilterBar } from '@/components/admin/FilterBar'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminApi } from '@/services/adminApi'
import { useAuth } from '@/contexts/useAuth'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(null)

  const load = useCallback(() => {
    adminApi
      .users()
      .then(setRows)
      .catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function patch(userId, body) {
    setBusy(userId)
    try {
      await adminApi.updateUser(userId, body)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(null)
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.email?.toLowerCase().includes(s) ||
        r.displayName?.toLowerCase().includes(s) ||
        r.id?.toLowerCase().includes(s),
    )
  }, [rows, q])

  const columns = [
    {
      key: 'avatar',
      label: '',
      render: (r) => (
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-500/40 to-indigo-600/40 text-sm font-bold text-white">
          {(r.displayName || r.email || '?').slice(0, 1).toUpperCase()}
        </span>
      ),
    },
    { key: 'displayName', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (r) => <StatusBadge variant="neutral">{r.role}</StatusBadge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge variant={r.accountStatus === 'active' ? 'success' : 'warning'}>{r.accountStatus}</StatusBadge>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'lastActive',
      label: 'Last active',
      render: (r) => (r.lastActive ? new Date(r.lastActive).toLocaleString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {me?.role === 'admin' && r.id !== me?.id ? (
            <>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => patch(r.id, { role: 'admin' })}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5"
              >
                Admin
              </button>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => patch(r.id, { role: 'moderator' })}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5"
              >
                Mod
              </button>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => patch(r.id, { role: 'user' })}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5"
              >
                User
              </button>
            </>
          ) : null}
          <button
            type="button"
            disabled={busy === r.id || r.id === me?.id}
            onClick={() => patch(r.id, { accountStatus: 'suspended' })}
            className="rounded-lg border border-amber-500/30 px-2 py-1 text-[11px] text-amber-200 hover:bg-amber-500/10"
          >
            Suspend
          </button>
          <button
            type="button"
            disabled={busy === r.id || r.id === me?.id}
            onClick={() => patch(r.id, { accountStatus: 'banned' })}
            className="rounded-lg border border-rose-500/30 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-500/10"
          >
            Ban
          </button>
          <button
            type="button"
            disabled={busy === r.id}
            onClick={() => patch(r.id, { accountStatus: 'active' })}
            className="rounded-lg border border-emerald-500/30 px-2 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/10"
          >
            Active
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Directory with role and account state. Promoting to admin requires administrator role.</p>
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      <FilterBar value={q} onChange={setQ} placeholder="Search name, email, id" />
      <DataTable columns={columns} rows={filtered} emptyMessage="No users match." />
    </div>
  )
}
