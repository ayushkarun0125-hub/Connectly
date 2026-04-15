import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

/**
 * Blocks the main workspace shell for staff: admins → /app/admin, moderators → /app/moderator.
 * Profile setup stays on /app/profile/setup (outside this gate).
 */
function AdminPortalGate() {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return <Navigate to="/app/admin" replace />
  }
  if (user?.role === 'moderator') {
    return <Navigate to="/app/moderator" replace />
  }
  return <Outlet />
}

export default AdminPortalGate
