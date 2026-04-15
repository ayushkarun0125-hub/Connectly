import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import EmptyState from '../components/connectly/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { fetchDmConversations } from '../services/dmService'
import { fetchWorkspaceMembers } from '../services/workspaceService'
import { useAuth } from '../contexts/useAuth'

function parsePeerId(conversationId, selfId) {
  if (!conversationId || !String(conversationId).startsWith('dm_')) return null
  const [a, b] = String(conversationId).replace(/^dm_/, '').split('_')
  if (!a || !b) return null
  return String(a) === String(selfId) ? String(b) : String(a)
}

function formatUpdated(ts) {
  if (!ts) return 'No activity yet'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return 'No activity yet'
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function DirectMessagesPage() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchDmConversations(), fetchWorkspaceMembers()])
      .then(([dmRows, people]) => {
        if (cancelled) return
        setConversations(Array.isArray(dmRows) ? dmRows : [])
        setMembers(Array.isArray(people) ? people : [])
      })
      .catch(() => {
        if (cancelled) return
        setConversations([])
        setMembers([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    const selfId = user?.id
    const mapped = conversations.map((conv) => {
      const peerId = parsePeerId(conv.id, selfId)
      const peer = members.find((m) => String(m.id) === String(peerId))
      const displayName = peer?.displayName || peer?.email || (peerId ? `User ${peerId}` : 'Unknown user')
      return {
        id: conv.id,
        peerId,
        displayName,
        email: peer?.email || '',
        updatedAt: conv.updatedAt || null,
      }
    })
    const needle = q.trim().toLowerCase()
    if (!needle) return mapped
    return mapped.filter((r) => r.displayName.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle))
  }, [conversations, members, user?.id, q])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direct Messages"
        description="See all your one-on-one conversations and jump back in quickly."
      />

      <ConnectlyPanel>
        <div className="mb-5 max-w-md">
          <SearchInput
            placeholder="Search direct messages..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search direct messages"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl bg-white/[0.06]" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No direct messages yet"
            description="Start one from the Team page and it will appear here."
          />
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  to={`/app/dm/${encodeURIComponent(row.id)}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:border-blue-500/35 hover:bg-blue-500/8"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{row.displayName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {row.email || 'Direct conversation'} {row.peerId ? `· #${row.peerId}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-slate-500">{formatUpdated(row.updatedAt)}</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                      <MessageCircle className="h-3 w-3" />
                      Open
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ConnectlyPanel>
    </div>
  )
}

