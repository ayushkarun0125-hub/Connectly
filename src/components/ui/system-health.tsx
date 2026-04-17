import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Server } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import { SystemHealthRow, type HealthServiceRow, type HealthServiceStatus } from '@/components/ui/system-health-row'

export type { HealthServiceRow, HealthServiceStatus }

function formatCheckedAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export type SystemHealthProps = {
  services: HealthServiceRow[]
  className?: string
  lastCheckedAt?: number | null
  onRefresh?: () => void
  isRefreshing?: boolean
  stackUptimeLabel?: string | null
  diagnosticsError?: string | null
}

export function SystemHealth({
  services,
  className,
  lastCheckedAt = null,
  onRefresh,
  isRefreshing = false,
  stackUptimeLabel = null,
  diagnosticsError = null,
}: SystemHealthProps) {
  const [, setRelativeTick] = useState(0)
  useEffect(() => {
    if (lastCheckedAt == null) return undefined
    const id = window.setInterval(() => setRelativeTick((n) => n + 1), 15_000)
    return () => window.clearInterval(id)
  }, [lastCheckedAt])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: dashboardEase }}
      className={cn(
        'rounded-2xl border border-sky-500/10 bg-[#060b14]/72 p-6 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_64px_-36px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-white">System health</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Realtime collaboration stack</p>
          {stackUptimeLabel ? (
            <p className="mt-2 text-[11px] font-medium tabular-nums text-slate-500">{stackUptimeLabel}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {lastCheckedAt != null ? (
            <span
              className="hidden max-w-[7rem] truncate text-right text-[10px] font-medium text-slate-500 sm:block"
              title={new Date(lastCheckedAt).toLocaleString()}
            >
              Updated {formatCheckedAgo(lastCheckedAt)}
            </span>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? 'Refreshing system status' : 'Refresh system status'}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-colors',
                'hover:border-[#38BDF8]/35 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} strokeWidth={2} />
            </button>
          ) : null}
          <Server className="h-4 w-4 text-[#38BDF8]/85" strokeWidth={1.75} />
        </div>
      </div>
      {diagnosticsError ? (
        <p className="mb-4 rounded-lg border border-amber-400/25 bg-amber-500/[0.08] px-3 py-2 text-xs leading-relaxed text-amber-100/95">
          Diagnostics request failed — metrics may be stale. {diagnosticsError}
        </p>
      ) : null}
      <ul className="space-y-0 rounded-xl border border-white/[0.06] bg-[#030712]/75 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {services.map((row, i) => (
          <SystemHealthRow key={row.id} row={row} index={i} />
        ))}
      </ul>
    </motion.div>
  )
}
