import { SignUp, useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'

function SignupPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (isSignedIn) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="flex min-h-screen justify-center bg-slate-950 p-6 pt-16">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  )
}

export default SignupPage
