import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, MessageSquare, Pencil, Upload, UserPlus, Users, FolderOpen } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import AvatarGroup from '../components/ui/AvatarGroup'
import PageHeader from '../components/connectly/PageHeader'
import SectionHeader from '../components/connectly/SectionHeader'
import { fetchDashboard } from '../services/chatService'
import { FileText } from 'lucide-react'

const cardBase =
  'rounded-[22px] border border-white/[0.08] bg-[#0d1729] p-5 shadow-xl shadow-black/20'

function StatTile({ label, value, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBase} flex items-center gap-4`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </motion.div>
  )
}

const activityIcon = {
  join: UserPlus,
  message: MessageSquare,
  file: Upload,
}

function DashboardPage() {
  const navigate = useNavigate()
  const outlet = useOutletContext()
  const openCreateRoom = outlet?.openCreateRoom

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    rooms: [],
    activeUsers: [],
    sharedFilesCount: 0,
    unreadMessagesTotal: 0,
    activity: [],
    recentFiles: [],
  })

  useEffect(() => {
    fetchDashboard().then((dash) => {
      setData(dash)
      setLoading(false)
    })
  }, [])

  const teamWithPresence = useMemo(
    () =>
      data.activeUsers.map((u, i) => ({
        ...u,
        online: i < 2,
      })),
    [data.activeUsers],
  )

  const onlineCount = teamWithPresence.filter((u) => u.online).length

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[22px] bg-white/[0.06]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace overview"
        description="Collaborate with your team in one place — rooms, files, and presence at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active Rooms" value={data.rooms.length} icon={LayoutGrid} />
        <StatTile label="Online Users" value={onlineCount} icon={Users} />
        <StatTile label="Unread Messages" value={data.unreadMessagesTotal} icon={MessageSquare} />
        <StatTile label="Shared Files" value={data.sharedFilesCount} icon={FolderOpen} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${cardBase} xl:col-span-2`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Active Rooms</h2>
            <Link
              to="/app/room-directory"
              className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              Browse all
            </Link>
          </div>
          <ul className="space-y-2">
            {data.rooms.map((room) => (
              <li key={room.id}>
                <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }}>
                  <Link
                    to={`/app/rooms/${room.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-transparent bg-white/[0.03] p-4 transition hover:border-white/[0.1] hover:bg-white/[0.05]"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/12 text-blue-200">
                      <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-white">{room.name}</span>
                        {room.unread > 0 ? (
                          <span className="rounded-full bg-blue-500/25 px-2 py-0.5 text-xs font-semibold text-blue-200">
                            {room.unread} new
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500">{room.lastMessage}</p>
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="text-emerald-400/90">{room.onlineInRoom} online</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{room.members} members</span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={cardBase}
        >
          <h2 className="mb-4 text-base font-semibold text-white">Recent Activity</h2>
          <ul className="relative space-y-0 pl-1">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.08]" aria-hidden />
            {data.activity.map((item) => {
              const Icon = activityIcon[item.type] || MessageSquare
              return (
                <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#07111f] text-slate-400">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium text-white">{item.actor}</span>{' '}
                      <span className="text-slate-500">{item.action}</span>{' '}
                      <span className="text-slate-200">{item.target}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{item.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardBase}
        >
          <h2 className="mb-4 text-base font-semibold text-white">Team Presence</h2>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <AvatarGroup users={teamWithPresence} showPresence />
            <div className="text-right">
              <p className="text-2xl font-semibold text-white tabular-nums">{onlineCount}</p>
              <p className="text-sm text-slate-500">users online</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">
            Presence updates when teammates open a room. Invite others from Team or Settings.
          </p>
          <Link
            to="/app/team"
            className="mt-4 inline-block text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            Open team directory →
          </Link>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={cardBase}
        >
          <h2 className="mb-4 text-base font-semibold text-white">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openCreateRoom?.()}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Create Room
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/rooms/join')}
              className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              Join Room
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/rooms/room_design/whiteboard')}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Pencil className="h-4 w-4 text-slate-400" strokeWidth={2} />
              Start Whiteboard
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/files')}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Upload className="h-4 w-4 text-slate-400" strokeWidth={2} />
              Upload File
            </motion.button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className={`${cardBase} xl:col-span-3`}
        >
          <SectionHeader
            title="Recent files"
            description="Latest uploads recorded for your workspace"
            action={(
              <Link to="/app/files" className="text-sm font-medium text-blue-400 transition hover:text-blue-300">
                Open files
              </Link>
            )}
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(data.recentFiles || []).slice(0, 4).map((file) => (
              <li
                key={file.id}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-white/[0.14]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-200">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {file.sender} · {file.roomId}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  )
}

export default DashboardPage
