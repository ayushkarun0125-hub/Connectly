import { Link } from 'react-router-dom'
import { Hash, Trash2, PanelRightClose } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

function RoomListItem({ to, label, active, unread = 0, onRemoveFromList, onDelete, canDelete }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group flex items-stretch gap-0.5"
    >
      <Link
        to={to}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
          active
            ? 'bg-blue-500/18 text-blue-50 shadow-[0_0_20px_-8px_rgba(59,130,246,0.7),inset_0_0_0_1px_rgba(96,165,250,0.25)]'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
        )}
      >
        <Hash className={cn('h-4 w-4 shrink-0', active ? 'text-blue-300' : 'opacity-60')} strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        {unread > 0 ? (
          <span className="shrink-0 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </Link>
      {(onRemoveFromList || (canDelete && onDelete)) && (
        <div className="flex shrink-0 flex-col justify-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 lg:opacity-100">
          {onRemoveFromList ? (
            <button
              type="button"
              title="Remove from sidebar"
              onClick={(e) => {
                e.preventDefault()
                onRemoveFromList()
              }}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            >
              <PanelRightClose className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : null}
          {canDelete && onDelete ? (
            <button
              type="button"
              title="Delete room"
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              className="rounded-lg p-1.5 text-rose-400/90 hover:bg-rose-500/15 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}

export default RoomListItem
