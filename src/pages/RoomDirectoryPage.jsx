import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DoorOpen, Hash, LayoutGrid, Users } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import ActionButton from '../components/connectly/ActionButton'
import SectionHeader from '../components/connectly/SectionHeader'
import EmptyState from '../components/connectly/EmptyState'
import { fetchDashboard } from '../services/chatService'
import Skeleton from '../components/ui/Skeleton'

function RoomDirectoryPage() {
  const navigate = useNavigate()
  const outlet = useOutletContext()
  const openCreateRoom = outlet?.openCreateRoom
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    fetchDashboard().then((d) => {
      setRooms(d.rooms || [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rooms
    return rooms.filter((r) => r.name?.toLowerCase().includes(s) || r.id?.toLowerCase().includes(s))
  }, [rooms, q])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        description="Browse spaces, see activity at a glance, and jump into the right conversation."
        action={(
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={() => openCreateRoom?.()}>
              Create room
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => navigate('/app/rooms/join')}>
              Join with code
            </ActionButton>
          </div>
        )}
      />

      <ConnectlyPanel>
        <div className="mb-6 max-w-md">
          <SearchInput
            placeholder="Search rooms..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search rooms"
          />
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-[20px] bg-white/[0.06]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No rooms match your search"
            description="Try another keyword or create a new room for your team."
            action={(
              <ActionButton variant="primary" onClick={() => openCreateRoom?.()}>
                New room
              </ActionButton>
            )}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <Link
                  to={`/app/rooms/${encodeURIComponent(room.id)}`}
                  className="flex h-full flex-col rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-5 transition hover:border-blue-500/30 hover:shadow-[0_0_32px_-12px_rgba(59,130,246,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-200">
                        <Hash className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">{room.name}</h3>
                        <p className="truncate text-xs text-slate-500">{room.lastMessage}</p>
                      </div>
                    </div>
                    {room.unread > 0 ? (
                      <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {room.unread} new
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 text-emerald-400/90">
                      <Users className="h-3.5 w-3.5" />
                      {room.onlineInRoom ?? 0} online
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DoorOpen className="h-3.5 w-3.5" />
                      {room.members} members
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </ConnectlyPanel>

      <ConnectlyPanel>
        <SectionHeader
          title="Tips"
          description="Invite-only rooms keep your workspace tidy. Share invite codes from the chat header."
        />
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
          <li>Use the sidebar Chats view for day-to-day messaging.</li>
          <li>Pin files from chat (coming soon) to surface them for the whole room.</li>
        </ul>
      </ConnectlyPanel>
    </div>
  )
}

export default RoomDirectoryPage
