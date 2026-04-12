import { cn } from '@/lib/utils'

export function ChartCard({ title, description, action, children, className }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-5',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="min-h-[220px]">{children}</div>
    </div>
  )
}
