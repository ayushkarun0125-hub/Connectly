import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'

function RoleGate({ roles, children }) {
  const { isLoaded, user } = useAuth()
  if (!isLoaded) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }
  const role = user?.publicMetadata?.role ?? 'user'
  if (roles && !roles.includes(role)) {
    return <Navigate to="/app" replace />
  }
  return children
}

export default RoleGate
