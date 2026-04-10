import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function RoleGate({ roles, children }) {
  const { loading, user } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }
  const role = user?.role ?? 'user'
  if (roles && !roles.includes(role)) {
    return <Navigate to="/app" replace />
  }
  return children
}

export default RoleGate
