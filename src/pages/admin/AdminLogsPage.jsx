import { useEffect, useMemo, useState } from 'react'
import { FilterBar } from '@/components/admin/FilterBar'
import { ActivityFeed } from '@/components/ui/activity-feed'
import { adminApi } from '@/services/adminApi'

export default function AdminLogsPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')

  useEffect(() => {
    adminApi.logs().then(setData).catch((e) => setErr(e.message))
    const id = setInterval(() => adminApi.logs().then(setData).catch(() => {}), 12000)
    return () => clearInterval(id)
  }, [])

  const merged = useMemo(() => {
    const a = (data?.entries || []).map((e) => ({ ...e }))
    const b = (data?.synthetic || []).map((e) => ({ ...e, type: e.type || 'system' }))
    return [...a, ...b].sort((x, y) => new Date(y.at || 0) - new Date(x.at || 0))
  }, [data])

  const filtered = useMemo(() => {
    let list = merged
    if (type !== 'all') list = list.filter((e) => (e.type || '').toLowerCase() === type)
    const s = q.trim().toLowerCase()
    if (s) list = list.filter((e) => (e.message || '').toLowerCase().includes(s))
    return list.slice(0, 200)
  }, [merged, type, q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Activity feed. Polls every 12s.</p>
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      <FilterBar value={q} onChange={setQ} placeholder="Filter message text">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-slate-200"
        >
          <option value="all">all</option>
          <option value="auth">auth</option>
          <option value="system">system</option>
          <option value="admin">admin</option>
          <option value="settings">settings</option>
          <option value="room">room</option>
          <option value="moderation">moderation</option>
        </select>
      </FilterBar>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#080c14] p-4">
        <ActivityFeed items={filtered} />
      </div>
    </div>
  )
}
