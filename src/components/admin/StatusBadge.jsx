import { cn } from '@/lib/utils'

const variants = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200 shadow-[0_0_12px_-2px_rgba(245,158,11,0.25)]',
  danger: 'border-rose-500/40 bg-rose-500/10 text-rose-200 shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]',
  neutral: 'border-white/15 bg-white/5 text-slate-300',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-200 shadow-[0_0_12px_-2px_rgba(14,165,233,0.25)]',
}

export function StatusBadge({ children, variant = 'neutral', pulse = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variants[variant] || variants.neutral,
        pulse && 'animate-pulse',
        className,
      )}
    >
      {pulse ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" aria-hidden /> : null}
      {children}
    </span>
  )
}
