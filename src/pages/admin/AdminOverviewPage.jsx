import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Radio, Server, Users, Zap } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminApi } from '@/services/adminApi'
import { connectSocket } from '@/services/socket'

export default function AdminOverviewPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [socketOk, setSocketOk] = useState(false)

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch((e) => setErr(e.message))
    const s = connectSocket()
    const tick = () => setSocketOk(s.connected)
    tick()
    s.on('connect', tick)
    s.on('disconnect', tick)
    return () => {
      s.off('connect', tick)
      s.off('disconnect', tick)
    }
  }, [])

  const stats = data?.stats
  const activity = [
    ...(data?.activitySample || []),
    ...(data?.recentSignups || []).map((u) => ({
      id: `signup-${u.id}`,
      type: 'auth',
      at: u.createdAt,
      message: `New account: ${u.email}`,
    })),
  ].slice(0, 14)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Platform pulse for Connectly. Auth uses your existing JWT accounts (not Clerk). Realtime reflects Socket.io from this browser session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant={socketOk ? 'success' : 'danger'} pulse={socketOk}>
            Socket {socketOk ? 'live' : 'offline'}
          </StatusBadge>
          <StatusBadge variant="neutral">SQLite primary</StatusBadge>
        </div>
      </motion.div>

      {err ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard delay={0} title="Total users" value={stats ? String(stats.totalUsers) : '—'} hint="Registered accounts" icon={Users} />
        <StatCard delay={0.05} title="Active accounts" value={stats ? String(stats.activeUsers) : '—'} hint="Not suspended / banned" icon={Activity} />
        <StatCard delay={0.1} title="Active rooms" value={stats ? String(stats.activeRooms) : '—'} hint="Non-archived" icon={Radio} />
        <StatCard delay={0.15} title="Open reports" value={stats ? String(stats.reportedItems) : '—'} hint="Moderation queue" icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">System health</h2>
            <Server className="h-4 w-4 text-slate-500" />
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/5 py-2 text-slate-400">
              <span>REST API</span>
              <StatusBadge variant="success">Operational</StatusBadge>
            </li>
            <li className="flex justify-between border-b border-white/5 py-2 text-slate-400">
              <span>WebSocket gateway</span>
              <StatusBadge variant={socketOk ? 'success' : 'warning'}>{socketOk ? 'Connected' : 'Disconnected'}</StatusBadge>
            </li>
            <li className="flex justify-between py-2 text-slate-400">
              <span>Persistence</span>
              <StatusBadge variant="success">SQLite</StatusBadge>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Quick actions</h2>
            <Zap className="h-4 w-4 text-amber-400/80" />
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/app/admin/users"
              className="rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2.5 text-sm text-slate-300 hover:border-sky-500/30 hover:text-white"
            >
              Open user directory
            </Link>
            <Link
              to="/app/admin/moderation"
              className="rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2.5 text-sm text-slate-300 hover:border-sky-500/30 hover:text-white"
            >
              Review moderation queue
            </Link>
            <Link
              to="/app/admin/system"
              className="rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2.5 text-sm text-slate-300 hover:border-sky-500/30 hover:text-white"
            >
              Inspect system status
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Recent activity</h2>
          {activity.length ? <ActivityFeed items={activity} /> : <p className="text-sm text-slate-500">No recent events.</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Moderation preview</h2>
          <ul className="space-y-2">
            {(data?.moderationPreview || []).map((r) => (
              <li key={r.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-slate-300">
                <span className="font-mono text-xs text-amber-200/80">{r.type}</span>
                <p className="text-slate-400">{r.reason}</p>
              </li>
            ))}
            {!data?.moderationPreview?.length ? <p className="text-sm text-slate-500">Queue empty.</p> : null}
          </ul>
        </div>
      </div>
    </div>
  )
}
