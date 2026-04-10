import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

function EmptyState({ icon: Icon = Inbox, title, description, className, action }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 px-6 py-12 text-center dark:border-white/[0.1] dark:bg-white/[0.02]',
        className,
      )}
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-200/60 text-slate-600 dark:bg-white/[0.06] dark:text-slate-500">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-300">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export default EmptyState
