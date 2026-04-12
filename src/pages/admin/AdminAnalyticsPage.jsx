import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import { ChartCard } from '@/components/admin/ChartCard'
import { adminApi } from '@/services/adminApi'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [range, setRange] = useState('14d')

  useEffect(() => {
    adminApi
      .analytics()
      .then(setData)
      .catch((e) => setErr(e.message))
  }, [])

  const msgChart = useMemo(() => {
    const rows = data?.messagesByDay || []
    const slice = range === '7d' ? rows.slice(-7) : rows
    return slice.map((r) => ({
      day: r.day?.slice(5) || r.day,
      messages: r.messages,
    }))
  }, [data, range])

  const topRooms = (data?.topRooms || []).map((r) => ({
    name: r.roomId?.replace(/^room_/, '').slice(0, 12) || r.roomId,
    count: r.count,
  }))

  const topUsers = data?.topUsers || []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Derived from SQLite message timestamps and upload directory.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRange('7d')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${range === '7d' ? 'bg-sky-600 text-white' : 'border border-white/10 text-slate-400'}`}
          >
            7d
          </button>
          <button
            type="button"
            onClick={() => setRange('14d')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${range === '14d' ? 'bg-sky-600 text-white' : 'border border-white/10 text-slate-400'}`}
          >
            14d
          </button>
        </div>
      </div>

      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">DAU (est.)</p>
          <p className="mt-1 text-2xl font-bold text-white">{data?.dauEstimate ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Files on disk</p>
          <p className="mt-1 text-2xl font-bold text-white">{data?.uploadCount ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Top room traffic</p>
          <p className="mt-1 text-2xl font-bold text-white">{topRooms[0]?.count ?? '—'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Messages per day" description="Count of rows in messages table by date">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={msgChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0d121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="messages" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most active rooms" description="Total messages per roomId">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRooms} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={88} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0d121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top contributors" description="By message count (socket id / guest username)">
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                <th className="pb-2">User</th>
                <th className="pb-2">Id</th>
                <th className="pb-2 text-right">Messages</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((u) => (
                <tr key={u.userId} className="border-b border-white/5">
                  <td className="py-2 text-slate-200">{u.username}</td>
                  <td className="py-2 font-mono text-xs text-slate-500">{u.userId?.slice(0, 14)}</td>
                  <td className="py-2 text-right tabular-nums text-slate-300">{u.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
