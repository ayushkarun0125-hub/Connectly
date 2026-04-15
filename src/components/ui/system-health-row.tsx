import { motion } from 'framer-motion'
import { Database, Radio, Server } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'

export type HealthServiceStatus = 'operational' | 'degraded' | 'offline'

export type HealthServiceRow = {
  id: string
  label: string
  description: string
  status: HealthServiceStatus
  icon?: 'api' | 'socket' | 'db'
  pulse?: boolean
}

const iconMap = {
  api: Server,
  socket: Radio,
  db: Database,
}

const statusStyles: Record<HealthServiceStatus, string> = {
  operational:
    'border-emerald-400/45 bg-emerald-500/[0.13] text-emerald-50 shadow-[0_0_24px_-8px_rgba(34,197,94,0.45)] ring-1 ring-emerald-400/25',
  degraded:
    'border-dashboard-amber/45 bg-dashboard-amber/12 text-amber-50 shadow-[0_0_20px_-8px_var(--dashboard-glow-amber)] ring-1 ring-amber-400/15',
  offline:
    'border-rose-400/40 bg-rose-500/12 text-rose-100 shadow-[0_0_22px_-8px_rgba(251,113,133,0.35)] ring-1 ring-rose-400/20',
}

export type SystemHealthRowProps = {
  row: HealthServiceRow
  index: number
}

export function SystemHealthRow({ row, index }: SystemHealthRowProps) {
  const Icon = row.icon ? iconMap[row.icon] : Server
  const label =
    row.status === 'operational' ? 'Live' : row.status === 'degraded' ? 'Degraded' : 'Down'

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 * index, ease: dashboardEase }}
      className={cn(
        'group flex items-center justify-between gap-4 px-3 py-4 transition-colors duration-200',
        'border-b border-white/[0.06] last:border-b-0',
        'hover:bg-white/[0.035]',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <motion.span
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#38BDF8]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          whileHover={{ scale: 1.02, rotate: 1.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
        </motion.span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">{row.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{row.description}</p>
        </div>
      </div>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]',
          statusStyles[row.status],
        )}
      >
        {row.pulse && row.status === 'operational' ? (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"
              style={{ boxShadow: '0 0 14px rgba(52, 211, 153, 0.55)' }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.65)]" />
          </span>
        ) : null}
        <span>{label}</span>
      </span>
    </motion.li>
  )
}
