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
          'rounded-2xl border border-amber-400/15 bg-[#060b14]/65 p-px',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_56px_-32px_rgba(0,0,0,0.75)]',
        )}
      >
        <div
          className={cn(
            'rounded-[15px] bg-gradient-to-br from-amber-500/[0.08] via-transparent to-[#1D4ED8]/[0.06] p-px',
          )}
        >
          <div
            className={cn(
              'rounded-[14px] border border-white/[0.06] bg-[#070d14]/90 p-6',
              'backdrop-blur-xl',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
            )}
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl border border-amber-400/30',
                    'bg-amber-500/12 text-amber-200',
                    'shadow-[0_0_20px_-8px_rgba(245,158,11,0.35)]',
                  )}
                >
                  <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-white">Moderation preview</h2>
                  <p className="text-xs text-amber-200/70">Items needing review</p>
                </div>
              </div>
              <Link
                to={queuePath}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-100/95 transition hover:border-amber-300/40 hover:bg-amber-500/14"
              >
                Open queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="space-y-2.5">
              {items.length === 0 ? (
                <li className="rounded-xl border border-dashed border-white/10 bg-[#030712]/50 py-10 text-center text-sm text-slate-500">
                  Queue clear — no open flags.
                </li>
              ) : (
                items.map((r, i) => <ModerationItem key={r.id} item={r} index={i} />)
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
