import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Radio, ScrollText, Server, Shield, Users } from 'lucide-react'
import { ActivityFeed, type DashboardActivityItem } from '@/components/ui/activity-feed'
import { ModerationPreview } from '@/components/ui/moderation-preview'
import { QuickActions } from '@/components/ui/quick-actions'
import { StatCard } from '@/components/ui/stat-card'
import { SystemHealth } from '@/components/ui/system-health'
import { adminApi } from '@/services/adminApi'
import { connectSocket } from '@/services/socket'
import { dashboardEase } from '@/lib/dashboard-motion'

type OverviewData = {
  stats?: {
    totalUsers: number
    activeUsers: number
    activeRooms: number
    reportedItems: number
    totalMessages?: number
  }
  recentSignups?: { id: string; email: string; createdAt: string }[]
  moderationPreview?: {
    id: string
    type: string
    reason: string
    roomId?: string
    status?: string
    target?: string
    createdAt?: string
  }[]
  activitySample?: { id?: string; type?: string; at?: string; message?: string }[]
}

function sparkFromStat(n: number, len = 10): number[] {
  let x = Math.max(1, n % 93)
  return Array.from({ length: len }, (_, i) => {
    x = (x * 19 + i * 7 + n) % 100
    return 0.35 + (x / 100) * 0.65
  })
}

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${Math.round(n)} B`
  const units = ['KB', 'MB', 'GB']
  let v = n / 1024
  let u = 0
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024
    u += 1
  }
  const rounded = v >= 10 ? Math.round(v) : Number(v.toFixed(1))
  return `${rounded} ${units[u]}`
}

function formatProcessUptime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return null
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `Process uptime ${d}d ${h}h`
  if (h > 0) return `Process uptime ${h}h ${m}m`
  return `Process uptime ${m}m`
}

export type AdminOverviewPageProps = {
  portalBase?: string
  variant?: 'admin' | 'moderator'
}

export default function AdminOverviewPage({
  portalBase = '/app/admin',
  variant = 'admin',
}: AdminOverviewPageProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [socketOk, setSocketOk] = useState(false)
  const [systemSnapshot, setSystemSnapshot] = useState<Record<string, unknown> | null>(null)
  const [systemDiagErr, setSystemDiagErr] = useState<string | null>(null)
  const [systemRefreshing, setSystemRefreshing] = useState(false)
  const [lastSystemCheck, setLastSystemCheck] = useState<number | null>(null)
  const isModeratorPortal = variant === 'moderator'

  const refreshSystem = useCallback(async () => {
    setSystemRefreshing(true)
    setSystemDiagErr(null)
    const t0 = performance.now()
    try {
      const raw = await adminApi.system()
      const clientRttMs = Math.round(performance.now() - t0)
      setSystemSnapshot({ ...raw, clientRttMs })
      setLastSystemCheck(Date.now())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed'
      setSystemDiagErr(msg)
    } finally {
      setSystemRefreshing(false)
    }
  }, [])

  useEffect(() => {
    adminApi
      .overview()
      .then((d) => setData(d as OverviewData))
      .catch((e: Error) => setErr(e.message))
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

  useEffect(() => {
    void refreshSystem()
    const id = window.setInterval(() => void refreshSystem(), 45_000)
    return () => window.clearInterval(id)
  }, [refreshSystem])

  const stats = data?.stats
  const activity: DashboardActivityItem[] = useMemo(() => {
    const sample = (data?.activitySample || []).map((a, i) => ({
      id: a.id || `act-${i}`,
      type: a.type,
      at: a.at,
      message: a.message,
    }))
    const signups = (data?.recentSignups || []).map((u) => ({
      id: `signup-${u.id}`,
      type: 'auth',
      at: u.createdAt,
      message: `New account: ${u.email}`,
    }))
    return [...sample, ...signups].slice(0, 16)
  }, [data])

  const stackUptimeLabel = useMemo(() => {
    const sec = systemSnapshot?.uptimeSeconds
    return typeof sec === 'number' ? formatProcessUptime(sec) : null
  }, [systemSnapshot])

  const healthServices = useMemo(() => {
    const probeFailed = Boolean(systemDiagErr)
    const env = typeof systemSnapshot?.environment === 'string' ? systemSnapshot.environment : null
    const port = typeof systemSnapshot?.api === 'object' && systemSnapshot.api && 'port' in systemSnapshot.api
      ? (systemSnapshot.api as { port?: number }).port
      : undefined
    const clientRtt =
      typeof systemSnapshot?.clientRttMs === 'number' ? systemSnapshot.clientRttMs : undefined

    const socketClients =
      typeof systemSnapshot?.socket === 'object' && systemSnapshot.socket && 'connectedClients' in systemSnapshot.socket
        ? (systemSnapshot.socket as { connectedClients?: number }).connectedClients
        : undefined

    const dbBytes =
      typeof systemSnapshot?.database === 'object' && systemSnapshot.database && 'sqliteBytes' in systemSnapshot.database
        ? (systemSnapshot.database as { sqliteBytes?: number }).sqliteBytes
        : undefined
    const dbPing = typeof systemSnapshot?.latencyMs === 'number' ? systemSnapshot.latencyMs : undefined

    return [
      {
        id: 'rest',
        label: 'REST API',
        description: 'Auth, rooms, uploads, workspace APIs',
        status: probeFailed ? ('degraded' as const) : ('operational' as const),
        icon: 'api' as const,
        pulse: !probeFailed,
        metrics: probeFailed
          ? [{ label: 'Probe', value: 'failed' }]
          : [
              ...(clientRtt != null ? [{ label: 'RTT', value: `${clientRtt} ms` }] : []),
              ...(port != null ? [{ label: 'Port', value: String(port) }] : []),
              ...(env ? [{ label: 'Env', value: env === 'production' ? 'prod' : 'dev' }] : []),
            ],
      },
      {
        id: 'ws',
        label: 'WebSocket gateway',
        description: 'Socket.io — chat, presence, whiteboard',
        status: socketOk ? ('operational' as const) : ('degraded' as const),
        icon: 'socket' as const,
        pulse: socketOk,
        metrics: [
          { label: 'Clients', value: socketClients != null ? String(socketClients) : '—' },
          { label: 'Transports', value: 'WS · poll' },
        ],
      },
      {
        id: 'db',
        label: 'Persistence',
        description: 'SQLite — messages, members, pins',
        status: probeFailed ? ('degraded' as const) : ('operational' as const),
        icon: 'db' as const,
        pulse: !probeFailed,
        metrics: [
          ...(dbBytes != null ? [{ label: 'DB file', value: formatBytes(dbBytes) }] : []),
          ...(dbPing != null ? [{ label: 'Ping', value: `${dbPing} ms` }] : []),
          ...(probeFailed ? [{ label: 'Probe', value: 'stale' }] : []),
        ],
      },
    ]
  }, [socketOk, systemDiagErr, systemSnapshot])

  const quickActionDefs = isModeratorPortal
    ? [
        {
          label: 'Open user directory',
          description: 'Review accounts, roles, and suspensions',
          to: `${portalBase}/users`,
          icon: Users,
        },
        {
          label: 'Review reports',
          description: 'Moderation queue and flags',
          to: `${portalBase}/moderation`,
          icon: Shield,
        },
        {
          label: 'Browse rooms',
          description: 'Operational room directory',
          to: `${portalBase}/rooms`,
          icon: Radio,
        },
      ]
    : [
        {
          label: 'Open user directory',
          description: 'Accounts, roles, and workspace state',
          to: `${portalBase}/users`,
          icon: Users,
        },
        {
          label: 'Review reports',
          description: 'Triage moderation items',
          to: `${portalBase}/moderation`,
          icon: Shield,
        },
        {
          label: 'Inspect logs',
          description: 'Recent platform events',
          to: `${portalBase}/logs`,
          icon: ScrollText,
        },
        {
          label: 'Manage roles',
          description: 'Permissions matrix',
          to: `${portalBase}/roles`,
          icon: Activity,
        },
      ]

  const tu = stats?.totalUsers ?? 0
  const au = stats?.activeUsers ?? 0
  const ar = stats?.activeRooms ?? 0
  const rep = stats?.reportedItems ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: dashboardEase }}
      className="space-y-10 pb-10 pt-2 md:space-y-11"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            {isModeratorPortal
              ? 'Connectly moderator console — focus on people, rooms, and safety signals without full system controls.'
              : 'Connectly control plane — live operations for your real-time chat, rooms, and collaboration stack.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/[0.12] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-50 shadow-[0_0_26px_-8px_rgba(34,197,94,0.5)] ring-1 ring-emerald-400/25">
            <span className="relative flex h-2.5 w-2.5">
              {socketOk ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]" />
                </>
              ) : (
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]" />
              )}
            </span>
            Socket {socketOk ? 'live' : 'reconnecting'}
          </span>
          <span className="rounded-full border border-white/[0.1] bg-[#060b14]/55 px-3.5 py-1.5 text-[11px] font-medium text-slate-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
            SQLite primary
          </span>
        </div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{err}</div>
      ) : null}

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total users"
          value={stats ? String(tu) : '—'}
          hint="Registered workspace accounts"
          icon={Users}
          delay={0}
          sparkline={sparkFromStat(tu)}
        />
        <StatCard
          title="Active accounts"
          value={stats ? String(au) : '—'}
          hint="Not suspended or banned"
          icon={Activity}
          delay={0.05}
          sparkline={sparkFromStat(au + 3)}
        />
        <StatCard
          title="Active rooms"
          value={stats ? String(ar) : '—'}
          hint="Non-archived chat spaces"
          icon={Radio}
          delay={0.1}
          sparkline={sparkFromStat(ar + 11)}
        />
        <StatCard
          title="Open reports"
          value={stats ? String(rep) : '—'}
          hint="Flags in moderation queue"
          icon={AlertTriangle}
          delay={0.15}
          sparkline={sparkFromStat(rep + 50)}
        />
      </div>

      <div className="grid gap-7 lg:grid-cols-12 lg:gap-9">
        <div className="space-y-7 lg:col-span-7">
          <SystemHealth
            services={healthServices}
            lastCheckedAt={lastSystemCheck}
            onRefresh={() => void refreshSystem()}
            isRefreshing={systemRefreshing}
            stackUptimeLabel={stackUptimeLabel}
            diagnosticsError={systemDiagErr}
          />
          <div
            className="rounded-2xl border border-sky-500/10 bg-[#060b14]/72 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_64px_-36px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">Recent activity</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Auth, moderation, and platform events</p>
              </div>
              <Server className="h-4 w-4 text-[#38BDF8]/75" strokeWidth={1.5} />
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#030712]/65 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
              <ActivityFeed items={activity} />
            </div>
          </div>
        </div>

        <div className="space-y-7 lg:col-span-5">
          <QuickActions
            title="Quick actions"
            subtitle="Shortcuts for daily operations"
            actions={quickActionDefs}
          />
          <ModerationPreview
            items={data?.moderationPreview || []}
            queuePath={`${portalBase}/moderation`}
          />
        </div>
      </div>
    </motion.div>
  )
}
