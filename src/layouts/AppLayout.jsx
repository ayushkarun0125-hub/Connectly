import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppSidebar from '../components/connectly/AppSidebar'
import AppTopbar from '../components/connectly/AppTopbar'
import CreateRoomModal from '../components/CreateRoomModal'
import { useAuth } from '../contexts/useAuth'
import { shellBg } from '../components/connectly/styles'
import { connectSocket } from '../services/socket'

function AppLayout() {
  const navigate = useNavigate()
  const { user, isSignedIn, logout } = useAuth()
  const role = user?.role ?? 'user'
  const staffPortal = role === 'admin' || role === 'moderator'
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /**
   * Join shared lobby + personal space so `room_members` overlaps everyone’s `room_access`
   * (dashboard “Online users” / per-room counts are DB-backed).
   */
  useEffect(() => {
    if (!isSignedIn || !user?.id) return
    const roomIds = [...new Set(['room_design', user.personalRoomId].filter(Boolean))]
    if (!roomIds.length) return

    const socket = connectSocket()
    const username = user.displayName || user.email || 'User'

    const joinPresence = () => {
      for (const roomId of roomIds) {
        socket.emit('join-room', { roomId, username })
      }
    }

    socket.on('connect', joinPresence)
    if (socket.connected) joinPresence()

    return () => {
      socket.off('connect', joinPresence)
      for (const roomId of roomIds) {
        socket.emit('leave-room', { roomId })
      }
    }
  }, [isSignedIn, user?.id, user?.personalRoomId, user?.displayName, user?.email])

  function handleCreatedRoom(created) {
    navigate(`/app/rooms/${encodeURIComponent(created.id)}`, {
      state: {
        inviteShare: { inviteCode: created.inviteCode, name: created.name },
      },
    })
  }

  return (
    <div className={`${shellBg} flex min-h-dvh bg-background`}>
      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreatedRoom}
      />

      <AppSidebar
        staffPortal={staffPortal}
        role={role}
        personalRoomId={user?.personalRoomId || null}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar
          user={user}
          isSignedIn={isSignedIn}
          onLogout={logout}
          onCreateRoom={() => setCreateModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto connectly-scroll p-4 md:p-6">
          <Outlet context={{ openCreateRoom: () => setCreateModalOpen(true) }} />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
