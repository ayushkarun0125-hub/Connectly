import { cn } from '@/lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-8 py-16 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-500">
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </span>
      ) : null}
      <p className="text-base font-semibold text-slate-200">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
