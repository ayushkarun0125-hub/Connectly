import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Radio, ScrollText, Server, Shield, Users, Zap } from 'lucide-react'
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
  moderationPreview?: { id: string; type: string; reason: string; roomId?: string }[]
  activitySample?: { id?: string; type?: string; at?: string; message?: string }[]
}

function sparkFromStat(n: number, len = 10): number[] {
  let x = Math.max(1, n % 93)
  return Array.from({ length: len }, (_, i) => {
    x = (x * 19 + i * 7 + n) % 100
    return 0.35 + (x / 100) * 0.65
  })
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
  const isModeratorPortal = variant === 'moderator'

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

  const healthServices = useMemo(
    () => [
      {
        id: 'rest',
        label: 'REST API',
        description: 'Auth, rooms, uploads, workspace APIs',
        status: 'operational' as const,
        icon: 'api' as const,
        pulse: true,
      },
      {
        id: 'ws',
        label: 'WebSocket gateway',
        description: 'Socket.io — chat, presence, whiteboard',
        status: socketOk ? ('operational' as const) : ('degraded' as const),
        icon: 'socket' as const,
        pulse: socketOk,
      },
      {
        id: 'db',
        label: 'Persistence',
        description: 'SQLite — messages, members, pins',
        status: 'operational' as const,
        icon: 'db' as const,
        pulse: true,
      },
    ],
    [socketOk],
  )

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
      className="space-y-12 pb-10 pt-2"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-dashboard-success/35 bg-dashboard-success/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-100 shadow-[0_0_28px_-8px_var(--dashboard-glow-success)]">
            <span className="relative flex h-2 w-2">
              {socketOk ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dashboard-success opacity-45" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-dashboard-success shadow-[0_0_12px_var(--dashboard-glow-success)]" />
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dashboard-amber shadow-[0_0_10px_var(--dashboard-glow-amber)]" />
              )}
            </span>
            Socket {socketOk ? 'live' : 'reconnecting'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            SQLite primary
          </span>
        </div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{err}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total users"
          value={stats ? String(tu) : '—'}
          hint="Registered workspace accounts"
          icon={Users}
          delay={0}
          trendUp="+3.8%"
          sparkline={sparkFromStat(tu)}
        />
        <StatCard
          title="Active accounts"
          value={stats ? String(au) : '—'}
          hint="Not suspended or banned"
          icon={Activity}
          delay={0.05}
          trendUp="+1.2%"
          sparkline={sparkFromStat(au + 3)}
        />
        <StatCard
          title="Active rooms"
          value={stats ? String(ar) : '—'}
          hint="Non-archived chat spaces"
          icon={Radio}
          delay={0.1}
          trendDown="-0.4%"
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

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-8 lg:col-span-7">
          <SystemHealth services={healthServices} />
          <div
            className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_28px_64px_-36px_rgba(0,0,0,0.75)]"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">Recent activity</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Auth, moderation, and platform events</p>
              </div>
              <Server className="h-4 w-4 text-dashboard-cyan/70" strokeWidth={1.5} />
            </div>
            <div className="rounded-xl border border-white/[0.05] bg-black/15 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <ActivityFeed items={activity} />
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <QuickActions
            title="Quick actions"
            subtitle="Shortcuts for daily operations"
            actions={quickActionDefs}
          />
          <ModerationPreview
            items={data?.moderationPreview || []}
            queuePath={`${portalBase}/moderation`}
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, ease: dashboardEase }}
            className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-dashboard-cyan/10 via-white/[0.03] to-dashboard-purple/10 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
          >
            <div className="flex items-center gap-2 text-dashboard-amber/95">
              <Zap className="h-4 w-4" strokeWidth={1.75} />
              <p className="text-xs font-medium uppercase tracking-wide">Tip</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Connectly routes realtime traffic over Socket.io. If reports spike, check the WebSocket pill above and
              verify the API host matches your Vite{' '}
              <code className="rounded-md border border-dashboard-cyan/20 bg-dashboard-cyan/10 px-1.5 py-0.5 text-[11px] text-dashboard-cyan">
                VITE_SERVER_URL
              </code>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
