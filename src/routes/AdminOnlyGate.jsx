import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

/** Full admin control plane — admins only; moderators use /app/moderator. */
function AdminOnlyGate({ children }) {
  const { loading, user } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }
  const role = user?.role ?? 'user'
  if (role === 'admin') return children
  if (role === 'moderator') return <Navigate to="/app/moderator" replace />
  return <Navigate to="/app" replace />
}

export default AdminOnlyGate
