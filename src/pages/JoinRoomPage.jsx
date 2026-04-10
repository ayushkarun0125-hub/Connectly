import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { resolveInviteCodeApi } from '../services/roomService'
import { useAppStore } from '../store/useAppStore'

function JoinRoomPage() {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleJoin(event) {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const room = await resolveInviteCodeApi(trimmed)
      if (!room?.id) {
        pushToast({
          title: 'Code not found',
          description: 'Check the code with whoever invited you, or ask for the full invite link.',
        })
        return
      }
      navigate(`/app/rooms/${encodeURIComponent(room.id)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Join a room</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter the 6-character invite code your friend shared.
        </p>
        <form onSubmit={handleJoin} className="mt-4 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. K7XQ2M"
            maxLength={16}
            autoComplete="off"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm tracking-widest outline-none focus:border-blue-500"
          />
          <Button type="submit" className="w-full" disabled={busy || !code.trim()}>
            {busy ? 'Looking up…' : 'Join room'}
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-slate-500">
        <Link to="/app/rooms/room_general" className="text-blue-300 hover:underline">
          Back to General
        </Link>
      </p>
    </div>
  )
}

export default JoinRoomPage
