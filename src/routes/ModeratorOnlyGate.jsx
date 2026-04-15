import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

/** Moderator operations console — moderators only. */
function ModeratorOnlyGate({ children }) {
  const { loading, user } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }
  const role = user?.role ?? 'user'
  if (role === 'moderator') return children
  if (role === 'admin') return <Navigate to="/app/admin" replace />
  return <Navigate to="/app" replace />
}

export default ModeratorOnlyGate
