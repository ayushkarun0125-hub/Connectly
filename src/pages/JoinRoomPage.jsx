import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hash } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import ActionButton from '../components/connectly/ActionButton'
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
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Join a room"
        description="Paste the invite code from your teammate. Codes are short and easy to share."
      />
      <ConnectlyPanel>
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-100/90">
          <Hash className="h-5 w-5 shrink-0 text-blue-300" strokeWidth={2} />
          Invite codes usually look like six or eight characters — no spaces needed.
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Invite code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7XQ2M"
              maxLength={16}
              autoComplete="off"
              className="w-full rounded-2xl border border-white/[0.1] bg-[#07111f] px-4 py-3 font-mono text-sm tracking-[0.2em] text-white outline-none focus:border-blue-500/45"
            />
          </label>
          <ActionButton variant="primary" className="w-full" type="submit" disabled={busy || !code.trim()}>
            {busy ? 'Looking up…' : 'Join room'}
          </ActionButton>
        </form>
      </ConnectlyPanel>
      <p className="text-center text-sm text-slate-500">
        <Link to="/app/rooms/room_general" className="font-medium text-blue-400 hover:text-blue-300">
          ← Back to General
        </Link>
      </p>
    </div>
  )
}

export default JoinRoomPage
