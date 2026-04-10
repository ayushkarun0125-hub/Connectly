import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import AvatarGroup from '../components/ui/AvatarGroup'
import Button from '../components/ui/Button'
import CreateRoomModal from '../components/CreateRoomModal'
import { fetchBackendHealth, fetchDashboard } from '../services/chatService'

function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ rooms: [], activeUsers: [], notifications: [] })
  const [health, setHealth] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchBackendHealth()]).then(([dash, h]) => {
      setData(dash)
      setHealth(h)
      setLoading(false)
    })
  }, [])

  function handleCreatedRoom(created) {
    navigate(`/app/rooms/${encodeURIComponent(created.id)}`, {
      state: {
        inviteShare: { inviteCode: created.inviteCode, name: created.name },
      },
    })
  }

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreatedRoom}
      />
      <Card className="md:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Backend status</h2>
            <p className="text-xs text-slate-400">
              {health?.ok
                ? `API reachable on port ${health.port ?? '—'}. Use the same origin in VITE_SERVER_URL.`
                : 'API not reachable — start the server and check VITE_SERVER_URL.'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${health?.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
          >
            {health?.ok ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/app/rooms/room_general"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Open live chat
          </Link>
          <Button onClick={() => setCreateModalOpen(true)}>New room</Button>
          <Link
            to="/app/rooms/join"
            className="inline-flex items-center rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-900"
          >
            Join with code
          </Link>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="font-semibold">Sample rooms</h2>
        <p className="mb-2 text-xs text-slate-500">Illustrative shortcuts — real history loads in chat via Socket.io.</p>
        <div className="mt-3 space-y-2">
          {data.rooms.map((room) => (
            <Link
              key={room.id}
              to={`/app/rooms/${room.id}`}
              className="block rounded-xl border border-slate-800 p-3 transition hover:border-blue-500/50"
            >
              <p className="font-medium">{room.name}</p>
              <p className="text-xs text-slate-400">{room.lastMessage}</p>
            </Link>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Demo avatars</h2>
        <p className="mb-2 text-xs text-slate-500">Mock roster — live presence appears in each chat room.</p>
        <div className="mt-3 flex items-center justify-between">
          <AvatarGroup users={data.activeUsers} />
          <span className="text-sm text-slate-400">{data.activeUsers.length} online</span>
        </div>
      </Card>
      <Card className="md:col-span-3">
        <h2 className="font-semibold">Sample notifications</h2>
        <p className="mb-2 text-xs text-slate-500">Placeholder content for the dashboard layout.</p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {data.notifications.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-800 p-3 text-sm">{item.text}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default DashboardPage
