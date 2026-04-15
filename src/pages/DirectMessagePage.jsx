import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import MessageFeed from '../components/MessageFeed'
import MessageInput from '../components/MessageInput'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import EmptyState from '../components/connectly/EmptyState'
import TypingIndicator from '../components/TypingIndicator'
import { connectSocket } from '../services/socket'
import { fetchDmMessages } from '../services/dmService'
import { useAuth } from '../contexts/useAuth'

function optimisticId() {
  return globalThis.crypto?.randomUUID?.() ?? `dm_opt_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function DirectMessagePage() {
  const { conversationId = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [typingUsers] = useState({})

  const selfUserId = user?.id || ''
  const typingNames = useMemo(() => Object.values(typingUsers), [typingUsers])

  useEffect(() => {
    if (!conversationId) return
    fetchDmMessages(conversationId)
      .then((rows) => setMessages(Array.isArray(rows) ? rows : []))
      .catch(() => setMessages([]))
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return
    const socket = connectSocket()
    const handleConnect = () => {
      socket.emit('join-dm', { conversationId }, (ack) => {
        if (!ack?.ok) navigate('/app/team')
      })
    }
    const handleHistory = ({ conversationId: cid, messages: history }) => {
      if (cid !== conversationId) return
      setMessages(Array.isArray(history) ? history : [])
    }
    const handleNewDm = (message) => {
      if (message?.conversationId !== conversationId) return
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
    }

    socket.on('connect', handleConnect)
    socket.on('dm-history', handleHistory)
    socket.on('new-message-dm', handleNewDm)
    if (!socket.connected) socket.connect()
    else handleConnect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('dm-history', handleHistory)
      socket.off('new-message-dm', handleNewDm)
    }
  }, [conversationId, navigate])

  function sendMessage() {
    const content = messageInput.trim()
    if (!content || !conversationId) return
    const socket = connectSocket()
    if (!socket.connected) return
    const optimistic = {
      id: optimisticId(),
      conversationId,
      userId: selfUserId,
      username: user?.displayName || user?.email || 'You',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages((prev) => [...prev, optimistic])
    socket.emit('send-message-dm', { conversationId, content, type: 'text' })
    setMessageInput('')
  }

  return (
    <ConnectlyPanel className="flex min-h-[70vh] flex-col" noPadding>
      <header className="border-b border-white/[0.08] px-5 py-4">
        <h1 className="text-lg font-semibold text-white">Direct message</h1>
        <p className="text-xs text-slate-500">{conversationId}</p>
      </header>
      <div className="connectly-scroll flex-1 overflow-y-auto p-4">
        {messages.length ? (
          <MessageFeed messages={messages} selfUserId={selfUserId} />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start your private conversation."
          />
        )}
      </div>
      <div className="border-t border-white/[0.08] px-5 py-4">
        <TypingIndicator usernames={typingNames} />
        <MessageInput
          value={messageInput}
          onChange={setMessageInput}
          onSubmit={sendMessage}
          onTyping={() => {}}
        />
      </div>
    </ConnectlyPanel>
  )
}

