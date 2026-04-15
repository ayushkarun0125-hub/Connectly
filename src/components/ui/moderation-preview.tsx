import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import { ModerationItem, type ModerationPreviewItem } from '@/components/ui/moderation-item'

export type { ModerationPreviewItem }

export type ModerationPreviewProps = {
  items: ModerationPreviewItem[]
  queuePath: string
  className?: string
}

export function ModerationPreview({ items, queuePath, className }: ModerationPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16, ease: dashboardEase }}
      className={cn('relative', className)}
    >
      <div
        className={cn(
          'rounded-2xl bg-gradient-to-br from-dashboard-amber/25 via-dashboard-purple/10 to-transparent p-px',
          'shadow-[0_0_48px_-20px_var(--dashboard-glow-amber),0_0_0_1px_rgba(251,191,36,0.06)_inset]',
        )}
      >
        <div
          className={cn(
            'rounded-[15px] border border-white/[0.06] bg-gradient-to-b from-[#0c1018]/98 to-[#080c12]/98 p-6',
            'backdrop-blur-xl',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-xl border border-dashboard-amber/35',
                  'bg-dashboard-amber/15 text-dashboard-amber',
                  'shadow-[0_0_24px_-8px_var(--dashboard-glow-amber)]',
                )}
              >
                <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">Moderation preview</h2>
                <p className="text-xs text-dashboard-amber/75">Items needing review</p>
              </div>
            </div>
            <Link
              to={queuePath}
              className="inline-flex items-center gap-1 rounded-lg border border-dashboard-amber/25 bg-dashboard-amber/10 px-2.5 py-1.5 text-xs font-medium text-dashboard-amber transition hover:border-dashboard-amber/40 hover:bg-dashboard-amber/15"
            >
              Open queue
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {items.length === 0 ? (
              <li className="rounded-xl border border-dashed border-white/10 bg-black/25 py-10 text-center text-sm text-slate-500">
                Queue clear — no open flags.
              </li>
            ) : (
              items.map((r, i) => <ModerationItem key={r.id} item={r} index={i} />)
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
