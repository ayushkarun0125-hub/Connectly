import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, FileText, LayoutGrid, MessageSquare, Pencil, Plus, Upload, UserPlus, Users, FolderOpen, Sparkles } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import { fetchDashboard } from '../services/chatService'

const cardBase = 'rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition duration-200'
const iconWrap = 'grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary'

function StatTile({ label, value, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`${cardBase} flex items-center gap-3`}
    >
      <div className={iconWrap}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
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

  const onlineCount = data.activeUsers.length
  const todayActivity = data.activity.slice(0, 6)
  const yesterdayActivity = data.activity.slice(6, 10)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-muted/40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 xl:space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Workspace overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rooms, activity, and team signals in one clean view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreateRoom?.()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30"
        >
          <Plus className="h-4 w-4" />
          Create Room
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active Rooms" value={data.rooms.length} icon={LayoutGrid} />
        <StatTile label="Online Users" value={onlineCount} icon={Users} />
        <StatTile label="Unread Messages" value={data.unreadMessagesTotal} icon={MessageSquare} />
        <StatTile label="Shared Files" value={data.sharedFilesCount} icon={FolderOpen} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className={`${cardBase}`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Active rooms</h2>
            <Link
              to="/app/room-directory"
              className="text-xs font-medium text-primary transition hover:opacity-80"
            >
              Browse all
            </Link>
          </div>
          <ul className="space-y-2.5">
            {data.rooms.map((room) => (
              <li key={room.id}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.995 }}>
                  <Link
                    to={`/app/rooms/${room.id}`}
                    className="group flex items-start gap-3 rounded-xl border border-border/80 bg-background/40 px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                      {room.unread > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{room.name}</span>
                        {room.unread > 0 ? (
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {room.unread} new
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{room.lastMessage}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-emerald-500">{room.onlineInRoom} online</span>
                        <span>•</span>
                        <span>{room.members} members</span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </motion.section>

        <aside className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`${cardBase} xl:sticky xl:top-20`}
          >
            <h2 className="mb-4 text-sm font-semibold text-foreground">Recent activity</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Today</p>
                <ul className="relative space-y-0.5 pl-1">
                  <span className="absolute left-[14px] top-2 bottom-2 w-px bg-border" aria-hidden />
                  {todayActivity.map((item) => {
                    const Icon = activityIcon[item.type] || MessageSquare
                    return (
                      <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                        <div className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{item.actor}</span>{' '}
                            <span className="text-muted-foreground">{item.action}</span>{' '}
                            <span className="text-primary">{item.target}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.time}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              {yesterdayActivity.length ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Yesterday</p>
                  <ul className="space-y-2">
                    {yesterdayActivity.map((item) => (
                      <li key={item.id} className="rounded-lg border border-border/70 bg-background/30 px-3 py-2">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{item.actor}</span>{' '}
                          <span className="text-muted-foreground">{item.action}</span>{' '}
                          <span className="text-primary">{item.target}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{item.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.section>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cardBase}>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openCreateRoom?.()}
              className="rounded-xl bg-blue-600 px-3 py-2.5 text-left text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30"
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/rooms/join')}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/60"
            >
              Join Room
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/rooms/room_design/whiteboard')}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/60"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              Whiteboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/files')}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/60"
            >
              <Upload className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              Upload File
            </button>
          </div>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cardBase}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent files</h2>
            <Link to="/app/files" className="text-xs font-medium text-primary">
              Open files
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(data.recentFiles || []).slice(0, 4).map((file) => (
              <li
                key={file.id}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/40 p-3 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <FileText className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.sender} • {file.roomId}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      <div className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
        <div className="space-y-2 rounded-2xl border border-border/80 bg-background/70 p-2 shadow-sm backdrop-blur-md">
          {[
            { icon: Bell, label: 'Alerts', onClick: () => {} },
            { icon: Sparkles, label: 'Tips', onClick: () => navigate('/app/notes') },
            { icon: Upload, label: 'Upload', onClick: () => navigate('/app/files') },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={item.onClick}
              className="group relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              <item.icon className="h-4.5 w-4.5" />
              <span className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground shadow-sm group-hover:block">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
