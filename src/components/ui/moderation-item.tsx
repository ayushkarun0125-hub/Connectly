import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export type ModerationPreviewItem = {
  id: string
  type: string
  reason: string
  roomId?: string
  status?: string
  target?: string
  createdAt?: string
  severity?: 'low' | 'med' | 'high'
}

function formatPreviewTime(iso?: string) {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 45) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function truncateTarget(s: string, max = 40) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function inferSeverity(type: string): 'low' | 'med' | 'high' {
  const t = type.toLowerCase()
  if (t.includes('spam') || t.includes('abuse') || t.includes('urgent') || t.includes('illegal')) return 'high'
  if (t.includes('report') || t.includes('flag') || t.includes('review')) return 'med'
  return 'low'
}

const severityRing: Record<'low' | 'med' | 'high', string> = {
  low: 'from-amber-400/12 via-transparent to-[#1D4ED8]/8',
  med: 'from-amber-400/22 via-amber-500/8 to-[#1D4ED8]/10',
  high: 'from-amber-400/30 via-rose-500/12 to-[#1D4ED8]/12',
}

const severityBadge: Record<'low' | 'med' | 'high', string> = {
  low: 'border-dashboard-amber/30 bg-dashboard-amber/15 text-amber-100',
  med: 'border-dashboard-amber/45 bg-dashboard-amber/20 text-amber-50 shadow-[0_0_16px_-4px_var(--dashboard-glow-amber)]',
  high: 'border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_-4px_rgba(251,113,133,0.35)]',
}

export type ModerationItemProps = {
  item: ModerationPreviewItem
  index: number
}

const queueStatusClass: Record<string, string> = {
  pending: 'border-amber-400/35 bg-amber-500/12 text-amber-100',
  reviewing: 'border-sky-400/35 bg-sky-500/12 text-sky-100',
}

export function ModerationItem({ item, index }: ModerationItemProps) {
  const severity = item.severity ?? inferSeverity(item.type)
  const st = (item.status || 'pending').toLowerCase()
  const statusClass = queueStatusClass[st] || 'border-white/15 bg-white/[0.06] text-slate-200'
  const statusLabel =
    st === 'reviewing' ? 'Reviewing' : st === 'pending' ? 'Pending' : st.replace(/_/g, ' ')
  const when = formatPreviewTime(item.createdAt)
  const targetLine = item.target ? truncateTarget(item.target) : null

  return (
    <motion.li
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.008 }}
      className="list-none"
    >
      <div
        className={cn(
          'rounded-xl bg-gradient-to-br p-px shadow-[0_0_32px_-16px_var(--dashboard-glow-amber)]',
          severityRing[severity],
        )}
      >
        <div
          className={cn(
            'rounded-[11px] border border-white/[0.07] bg-[#060b12]/92 px-3.5 py-3',
            'backdrop-blur-sm transition-colors hover:border-amber-400/22 hover:bg-[#070e18]/95',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
                  severityBadge[severity],
                )}
              >
                {item.type}
              </span>
              {item.status ? (
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    statusClass,
                  )}
                >
                  {statusLabel}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-0.5 font-mono text-[10px] text-slate-500">
              {when ? <span className="shrink-0 tabular-nums">{when}</span> : null}
              {item.roomId ? <span className="max-w-[10rem] truncate">{item.roomId}</span> : null}
            </div>
          </div>
          {targetLine ? (
            <p className="mt-1.5 truncate font-mono text-[10px] text-slate-500" title={item.target}>
              Target · {targetLine}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.reason}</p>
        </div>
      </div>
    </motion.li>
  )
}
