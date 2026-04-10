import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Link2, MessageSquare, Pencil } from 'lucide-react'
import MessageFeed from '../components/MessageFeed'
import MessageInput from '../components/MessageInput'
import TypingIndicator from '../components/TypingIndicator'
import UserPresencePanel from '../components/UserPresencePanel'
import CreateRoomModal from '../components/CreateRoomModal'
import Modal from '../components/ui/Modal'
import { connectSocket, disconnectSocket } from '../services/socket'
import { fetchRoomData } from '../services/chatService'
import { addRoomPin, fetchRoomPins, removeRoomPin } from '../services/pinService'
import {
  persistRoomLabelToStorage,
  readRoomLabelsFromStorage,
  updateRoomNameApi,
} from '../services/roomService'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../contexts/useAuth'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import RoomListItem from '../components/connectly/RoomListItem'
import ActionButton from '../components/connectly/ActionButton'
import SectionHeader from '../components/connectly/SectionHeader'
import EmptyState from '../components/connectly/EmptyState'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function optimisticId() {
  return globalThis.crypto?.randomUUID?.() ?? `opt_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function mergeInboundMessage(prev, message) {
  const idx = prev.findIndex(
    (m) =>
      m._optimistic &&
      m.userId === message.userId &&
      m.content === message.content &&
      (m.type || 'text') === (message.type || 'text'),
  )
  const next = idx === -1 ? prev : [...prev.slice(0, idx), ...prev.slice(idx + 1)]
  if (next.some((m) => m.id === message.id)) return next
  return [...next, message]
}

const DEFAULT_ROOM_IDS = ['room_general', 'room_design', 'room_backend']
const BUILTIN_ROOM_NAMES = {
  room_general: 'General',
  room_design: 'Design',
  room_backend: 'Backend',
}
const RECENT_ROOMS_KEY = 'connectly_recent_room_ids'

function readRecentRoomIds() {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function rememberRoomVisit(roomId) {
  if (!roomId) return
  try {
    const prev = readRecentRoomIds().filter((id) => id !== roomId)
    prev.unshift(roomId)
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(prev.slice(0, 20)))
  } catch {
    /* ignore */
  }
}

function shortenRoomId(id) {
  if (id.startsWith('room_') && id.length > 20) return `${id.slice(5, 13)}…`
  return id.replace(/^room_/, '') || id
}

function roomSidebarLabel(id, roomLabels) {
  return roomLabels[id] || BUILTIN_ROOM_NAMES[id] || shortenRoomId(id)
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function mapPins(rows) {
  return (rows || []).map((p) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    sender: p.sender || '',
    messageId: p.messageId,
    pinnedAt: p.pinnedAt,
  }))
}

function ChatPage() {
  const pushToast = useAppStore((state) => state.pushToast)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const role = user?.role ?? 'user'
  const { roomId = 'room_general' } = useParams()
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [pinnedFiles, setPinnedFiles] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [typingUsers, setTypingUsers] = useState({})
  const [socketId, setSocketId] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [driveOpen, setDriveOpen] = useState(false)
  const [driveUrl, setDriveUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [renameBusy, setRenameBusy] = useState(false)
  const [roomLabels, setRoomLabels] = useState(readRoomLabelsFromStorage)
  const username = user?.displayName || user?.email || 'User'

  const typingNames = useMemo(() => Object.values(typingUsers), [typingUsers])

  const recentRoomIds = useMemo(() => {
    void roomId
    return readRecentRoomIds()
  }, [roomId])

  const sidebarRoomIds = useMemo(() => {
    const extra = recentRoomIds.filter((id) => !DEFAULT_ROOM_IDS.includes(id))
    const merged = [...DEFAULT_ROOM_IDS, ...extra]
    if (roomId && !merged.includes(roomId)) return [roomId, ...merged]
    return merged
  }, [recentRoomIds, roomId])

  const headerTitle = currentRoom?.name || BUILTIN_ROOM_NAMES[roomId] || roomSidebarLabel(roomId, roomLabels)

  useEffect(() => {
    rememberRoomVisit(roomId)
  }, [roomId])

  useEffect(() => {
    fetchRoomData(roomId).then((data) => {
      setCurrentRoom(data.room)
      setPinnedFiles(data.pinnedFiles)
      if (data.room?.id && data.room?.name) {
        persistRoomLabelToStorage(data.room.id, data.room.name)
        setRoomLabels((prev) => ({ ...prev, [data.room.id]: data.room.name }))
      }
    })
  }, [roomId])

  async function refreshPins() {
    const rows = await fetchRoomPins(roomId)
    setPinnedFiles(mapPins(rows))
  }

  async function handlePinAttachment({ name, url, messageId, sender }) {
    try {
      await addRoomPin(roomId, { name, url, messageId, sender })
      await refreshPins()
      pushToast({ title: 'Pinned', description: `${name} is pinned for this room.` })
    } catch (err) {
      pushToast({
        title: 'Could not pin',
        description: err?.message || 'Sign in and try again.',
      })
    }
  }

  async function handleUnpin(pinId) {
    try {
      await removeRoomPin(roomId, pinId)
      await refreshPins()
      pushToast({ title: 'Unpinned' })
    } catch (err) {
      pushToast({ title: 'Remove failed', description: err?.message || 'Try again.' })
    }
  }

  function pinnedHref(url) {
    if (!url) return '#'
    return url.startsWith('/uploads') ? `${API_BASE}${url}` : url
  }

  useEffect(() => {
    const socket = connectSocket()

    const handleConnect = () => {
      setSocketId(socket.id || '')
      socket.emit('join-room', { roomId, username })
    }

    const handleRoomHistory = (history) => {
      setMessages(Array.isArray(history) ? history : [])
    }
    const handleNewMessage = (message) => {
      setMessages((prev) => mergeInboundMessage(prev, message))
    }
    const handleRoomUsers = (roomUsers) => setUsers(roomUsers)
    const handleUserJoined = (u) => {
      setUsers((prev) => {
        if (prev.some((item) => item.userId === u.userId)) return prev
        return [...prev, u]
      })
    }
    const handleUserLeft = ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId))
      setTypingUsers((prev) => {
        const copy = { ...prev }
        delete copy[userId]
        return copy
      })
    }
    const handleUserTyping = ({ userId, username: typingUsername }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: typingUsername }))
    }
    const handleUserStoppedTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev }
        delete copy[userId]
        return copy
      })
    }

    const handleConnectError = (err) => {
      pushToast({
        title: 'Realtime connection failed',
        description: err?.message || 'Start the server and set VITE_SERVER_URL to match its port.',
      })
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('room-history', handleRoomHistory)
    socket.on('new-message', handleNewMessage)
    socket.on('room-users', handleRoomUsers)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stopped-typing', handleUserStoppedTyping)
    socket.on('file-shared', handleNewMessage)

    if (!socket.connected) {
      socket.connect()
    } else {
      handleConnect()
    }

    return () => {
      socket.emit('leave-room', { roomId })
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('room-history', handleRoomHistory)
      socket.off('new-message', handleNewMessage)
      socket.off('room-users', handleRoomUsers)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stopped-typing', handleUserStoppedTyping)
      socket.off('file-shared', handleNewMessage)
      disconnectSocket()
    }
  }, [roomId, username, pushToast])

  function sendMessage() {
    const content = messageInput.trim()
    if (!content) return
    const socket = connectSocket()
    if (!socket.connected) {
      pushToast({
        title: 'Not connected',
        description: 'Open the Connectly server terminal and confirm VITE_SERVER_URL matches its URL.',
      })
      return
    }
    const userId = socket.id
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId(),
        userId,
        username,
        content,
        type: 'text',
        timestamp: new Date().toISOString(),
        _optimistic: true,
      },
    ])
    socket.emit('send-message', { roomId, content, type: 'text' })
    socket.emit('typing-stop', { roomId })
    setMessageInput('')
  }

  function handleTyping(action) {
    const socket = connectSocket()
    if (action === 'start') socket.emit('typing-start', { roomId })
    if (action === 'stop') socket.emit('typing-stop', { roomId })
  }

  async function handleUploadLocalFile() {
    if (!selectedFile) return
    const socket = connectSocket()
    if (!socket.connected) {
      pushToast({ title: 'Not connected', description: 'Connect to the server before uploading.' })
      return
    }
    setUploading(true)
    try {
      const base64 = await fileToBase64(selectedFile)
      socket.emit('upload-file', {
        roomId,
        filename: selectedFile.name,
        mimeType: selectedFile.type,
        data: base64,
      })
      setSelectedFile(null)
      setUploadOpen(false)
    } catch {
      pushToast({ title: 'Upload failed', description: 'Could not read the file.' })
    } finally {
      setUploading(false)
    }
  }

  function submitDriveAttachment() {
    const value = driveUrl.trim()
    if (!value) return
    const isDrive = /drive\.google\.com/.test(value)
    if (!isDrive) return
    const socket = connectSocket()
    if (!socket.connected) {
      pushToast({ title: 'Not connected', description: 'Connect to the server before sharing a link.' })
      return
    }
    const userId = socket.id
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId(),
        userId,
        username,
        content: value,
        type: 'drive-link',
        timestamp: new Date().toISOString(),
        _optimistic: true,
      },
    ])
    socket.emit('send-message', { roomId, content: value, type: 'drive-link' })
    setDriveUrl('')
    setDriveOpen(false)
  }

  const inviteShare = location.state?.inviteShare

  function dismissInviteShare() {
    navigate(`${location.pathname}${location.search || ''}`, { replace: true, state: {} })
  }

  async function copyInvite(text, description) {
    try {
      await navigator.clipboard.writeText(text)
      pushToast({ title: 'Copied', description })
    } catch {
      pushToast({ title: 'Copy failed', description: 'Select the text and copy manually.' })
    }
  }

  function handleCreatedRoom(created) {
    setRoomLabels((prev) => ({ ...prev, [created.id]: created.name }))
    navigate(`/app/rooms/${encodeURIComponent(created.id)}`, {
      state: {
        inviteShare: { inviteCode: created.inviteCode, name: created.name },
      },
    })
  }

  async function submitRename() {
    const next = renameDraft.trim()
    if (!next) {
      pushToast({ title: 'Name required', description: 'Enter a room name.' })
      return
    }
    setRenameBusy(true)
    try {
      const updated = await updateRoomNameApi(roomId, next)
      setCurrentRoom(updated)
      persistRoomLabelToStorage(updated.id, updated.name)
      setRoomLabels((prev) => ({ ...prev, [updated.id]: updated.name }))
      setRenameModalOpen(false)
      pushToast({ title: 'Room renamed', description: updated.name })
    } catch {
      pushToast({
        title: 'Rename failed',
        description: 'Check the server and that this room exists in the database.',
      })
    } finally {
      setRenameBusy(false)
    }
  }

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/app/rooms/${encodeURIComponent(roomId)}`
      : ''

  const showTechSession = role === 'admin' || role === 'moderator'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-[calc(100dvh-6.5rem)] lg:flex-row lg:gap-5">
      <ConnectlyPanel className="flex max-h-[40vh] flex-col lg:max-h-none lg:w-[260px] lg:shrink-0" noPadding>
        <div className="border-b border-white/[0.06] p-5 pb-4">
          <SectionHeader title="Rooms" />
          <div className="mt-3 flex flex-col gap-2">
            <ActionButton variant="primary" size="md" className="w-full" onClick={() => setCreateModalOpen(true)}>
              New room
            </ActionButton>
            <Link
              to="/app/rooms/join"
              className="flex w-full items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/[0.18] hover:bg-white/[0.08]"
            >
              Join with code
            </Link>
          </div>
        </div>
        <nav className="connectly-scroll flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarRoomIds.map((id) => (
            <RoomListItem
              key={id}
              to={`/app/rooms/${encodeURIComponent(id)}`}
              label={roomSidebarLabel(id, roomLabels)}
              active={roomId === id}
            />
          ))}
        </nav>
      </ConnectlyPanel>

      <ConnectlyPanel className="flex min-h-[320px] min-w-0 flex-1 flex-col lg:min-h-0" noPadding>
        <header className="shrink-0 border-b border-white/[0.06] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-white md:text-xl">{headerTitle}</h1>
              {showTechSession && socketId ? (
                <details className="mt-1 text-[11px] text-slate-500">
                  <summary className="cursor-pointer select-none hover:text-slate-400">Session details</summary>
                  <code className="mt-1 block max-w-full break-all font-mono text-[10px] text-slate-600">
                    {socketId}
                  </code>
                </details>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActionButton
                variant="ghost"
                size="sm"
                className="!rounded-full"
                onClick={() => {
                  setRenameDraft(currentRoom?.name || headerTitle)
                  setRenameModalOpen(true)
                }}
              >
                Rename
              </ActionButton>
              <Link
                to={`/app/rooms/${encodeURIComponent(roomId)}/whiteboard`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-100"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Whiteboard
              </Link>
              <ActionButton variant="secondary" size="sm" className="!rounded-full" onClick={() => setUploadOpen(true)}>
                Attach
              </ActionButton>
            </div>
          </div>
          {currentRoom?.inviteCode ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs">
              <span className="text-slate-500">Invite</span>
              <span className="font-mono font-semibold tracking-wider text-slate-100">{currentRoom.inviteCode}</span>
              <ActionButton variant="ghost" size="sm" onClick={() => copyInvite(currentRoom.inviteCode, 'Invite code copied.')}>
                Copy code
              </ActionButton>
              <ActionButton variant="ghost" size="sm" onClick={() => copyInvite(inviteLink, 'Room link copied.')}>
                Copy link
              </ActionButton>
            </div>
          ) : null}
        </header>

        <div className="connectly-scroll mx-3 mb-1 flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/50 px-2 py-3 dark:border-white/[0.06] dark:bg-[#07111f]/50 md:mx-5">
          {!messages.length ? (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Say hello and kick off the conversation. Messages sync in real time for everyone in the room."
              className="my-auto border-slate-200/60 bg-white/50 dark:border-white/[0.06] dark:bg-white/[0.02]"
            />
          ) : (
            <MessageFeed
              messages={messages}
              selfUserId={socketId}
              onPinAttachment={handlePinAttachment}
            />
          )}
        </div>
        <div className="shrink-0 border-t border-slate-200/80 px-5 py-4 dark:border-white/[0.06]">
          <TypingIndicator usernames={typingNames} />
          <MessageInput
            value={messageInput}
            onChange={setMessageInput}
            onSubmit={sendMessage}
            onTyping={handleTyping}
            onChooseLocalFile={(file) => {
              setSelectedFile(file)
              setUploadOpen(true)
            }}
            onChooseDriveLink={() => setDriveOpen(true)}
          />
        </div>
      </ConnectlyPanel>

      <div className="flex min-h-0 w-full flex-col gap-4 lg:w-[300px] lg:shrink-0">
        <UserPresencePanel users={users} />
        <ConnectlyPanel className="flex min-h-0 flex-1 flex-col" noPadding>
          <div className="border-b border-white/[0.06] p-5 pb-3">
            <SectionHeader title="Pinned files" description="Important links and uploads" />
          </div>
          <div className="connectly-scroll flex-1 space-y-2 overflow-y-auto p-5 pt-3">
            {pinnedFiles.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50 py-8 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-500">
                No pinned files yet. Hover a file or Drive link in chat and choose Pin.
              </p>
            ) : (
              pinnedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.12]"
                >
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <a
                      href={pinnedHref(file.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-slate-500">{file.sender}</p>
                  </div>
                  <ActionButton variant="ghost" size="sm" className="shrink-0 !px-2 !py-1 text-xs" onClick={() => handleUnpin(file.id)}>
                    Unpin
                  </ActionButton>
                </div>
              ))
            )}
          </div>
        </ConnectlyPanel>
      </div>

      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreatedRoom}
      />

      <Modal open={renameModalOpen} title="Rename room" onClose={() => setRenameModalOpen(false)}>
        <input
          value={renameDraft}
          onChange={(e) => setRenameDraft(e.target.value)}
          maxLength={80}
          className="w-full rounded-xl border border-white/[0.1] bg-[#07111f] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
        />
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" onClick={() => setRenameModalOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" disabled={renameBusy} onClick={submitRename}>
            {renameBusy ? 'Saving…' : 'Save'}
          </ActionButton>
        </div>
      </Modal>

      <Modal open={uploadOpen} title="Upload file" onClose={() => setUploadOpen(false)}>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-slate-300">
          {selectedFile ? (
            <>
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <p>No file selected.</p>
          )}
        </div>
        <ActionButton
          variant="primary"
          className="mt-4 w-full"
          disabled={!selectedFile || uploading}
          onClick={handleUploadLocalFile}
        >
          {uploading ? 'Uploading...' : 'Upload from computer'}
        </ActionButton>
      </Modal>

      <Modal open={driveOpen} title="Attach Google Drive file" onClose={() => setDriveOpen(false)}>
        <input
          value={driveUrl}
          onChange={(event) => setDriveUrl(event.target.value)}
          placeholder="Paste Google Drive share link"
          className="w-full rounded-xl border border-white/[0.1] bg-[#07111f] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
        />
        {!/^\s*$/.test(driveUrl) && !/drive\.google\.com/.test(driveUrl) ? (
          <p className="mt-2 text-xs text-rose-300">Please paste a valid Google Drive URL.</p>
        ) : null}
        <ActionButton variant="primary" className="mt-4 w-full" onClick={submitDriveAttachment}>
          Attach Drive link
        </ActionButton>
      </Modal>

      <Modal open={Boolean(inviteShare)} title="Room ready" onClose={dismissInviteShare}>
        <p className="text-sm text-slate-300">
          Share this code or link so friends can join{' '}
          <span className="font-medium text-white">{inviteShare?.name}</span>.
        </p>
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#07111f] p-4">
          <p className="text-xs text-slate-500">Invite code</p>
          <p className="font-mono text-lg font-semibold tracking-widest text-white">{inviteShare?.inviteCode}</p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <ActionButton
            variant="primary"
            className="flex-1"
            onClick={() => inviteShare?.inviteCode && copyInvite(inviteShare.inviteCode, 'Code copied.')}
          >
            Copy code
          </ActionButton>
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={() =>
              inviteShare &&
              copyInvite(`${window.location.origin}/app/rooms/${encodeURIComponent(roomId)}`, 'Link copied.')
            }
          >
            Copy link
          </ActionButton>
        </div>
      </Modal>
    </div>
  )
}

export default ChatPage
