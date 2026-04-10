import { cn } from '../../lib/utils'
import Badge from '../ui/Badge'

function roleBadgeVariant(role) {
  const r = String(role || 'member').toLowerCase()
  if (r === 'admin') return 'blue'
  if (r === 'moderator') return 'emerald'
  return 'slate'
}

function UserListItem({ name, role, online = true }) {
  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2.5 transition hover:border-slate-300 hover:bg-slate-100/80 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.04]',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white">
          {name.slice(0, 1).toUpperCase()}
          <span
            className={cn(
              'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0d1729]',
              online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-500',
            )}
            aria-hidden
          />
        </span>
        <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">{name}</span>
      </div>
      <Badge color={roleBadgeVariant(role)} className="!text-[10px] !font-semibold !uppercase !tracking-wide">
        {String(role || 'member').replace(/_/g, ' ')}
      </Badge>
    </li>
  )
}

export default UserListItem
