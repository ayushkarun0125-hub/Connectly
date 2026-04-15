import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppSidebar from '../components/connectly/AppSidebar'
import AppTopbar from '../components/connectly/AppTopbar'
import CreateRoomModal from '../components/CreateRoomModal'
import { useAuth } from '../contexts/useAuth'
import { shellBg } from '../components/connectly/styles'

function AppLayout() {
  const navigate = useNavigate()
  const { user, isSignedIn, logout } = useAuth()
  const role = user?.role ?? 'user'
  const staffPortal = role === 'admin' || role === 'moderator'
  const [createModalOpen, setCreateModalOpen] = useState(false)

  function handleCreatedRoom(created) {
    navigate(`/app/rooms/${encodeURIComponent(created.id)}`, {
      state: {
        inviteShare: { inviteCode: created.inviteCode, name: created.name },
      },
    })
  }

  return (
    <div className={`${shellBg} flex min-h-dvh`}>
      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreatedRoom}
      />

      <AppSidebar staffPortal={staffPortal} role={role} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar
          user={user}
          isSignedIn={isSignedIn}
          onLogout={logout}
          onCreateRoom={() => setCreateModalOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto connectly-scroll p-4 md:p-6">
          <Outlet context={{ openCreateRoom: () => setCreateModalOpen(true) }} />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
