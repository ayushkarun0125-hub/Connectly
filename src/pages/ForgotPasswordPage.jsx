import { Link } from 'react-router-dom'

function ForgotPasswordPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-transparent p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Password reset is handled on the sign-in screen. Open login and use the “Forgot password?”
          link there.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
