import { Link } from 'react-router-dom'
import { Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

function RoomListItem({ to, label, active, unread = 0 }) {
  return (
    <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
      <Link
        to={to}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
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
    </motion.div>
  )
}

export default RoomListItem
