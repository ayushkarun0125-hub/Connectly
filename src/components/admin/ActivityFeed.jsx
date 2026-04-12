import { cn } from '@/lib/utils'

export function ActivityFeed({ items, className }) {
  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item) => (
        <li
          key={item.id || `${item.at}-${item.message}`}
          className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        >
          <span className="shrink-0 font-mono text-[10px] text-slate-600">
            {item.at ? new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-500/90">{item.type}</span>
            <p className="text-slate-300">{item.message}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
