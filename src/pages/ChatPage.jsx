import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUser } from '@clerk/react'
import MessageFeed from '../components/MessageFeed'
import MessageInput from '../components/MessageInput'
import TypingIndicator from '../components/TypingIndicator'
import UserPresencePanel from '../components/UserPresencePanel'
import Card from '../components/ui/Card'
import { connectSocket, disconnectSocket } from '../services/socket'
import { fetchRoomData } from '../services/chatService'
import {
  persistRoomLabelToStorage,
  readRoomLabelsFromStorage,
  updateRoomNameApi,
} from '../services/roomService'
import CreateRoomModal from '../components/CreateRoomModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'

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

/** Replace one matching optimistic row with the server message, or append if none. */
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

function ChatPage() {
  const pushToast = useAppStore((state) => state.pushToast)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
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
  const username =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'User'

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

  useEffect(() => {
    const socket = connectSocket()

    const handleConnect = () => {
      setSocketId(socket.id)
      socket.emit('join-room', { roomId, username })
    }

    const handleRoomHistory = (history) => {
      setMessages(Array.isArray(history) ? history : [])
    }
    const handleNewMessage = (message) => {
      setMessages((prev) => mergeInboundMessage(prev, message))
    }
    const handleRoomUsers = (roomUsers) => setUsers(roomUsers)
    const handleUserJoined = (user) => {
      setUsers((prev) => {
        if (prev.some((item) => item.userId === user.userId)) return prev
        return [...prev, user]
      })
    }
    const handleUserLeft = ({ userId }) => {
      setUsers((prev) => prev.filter((user) => user.userId !== userId))
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

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_280px]">
      <Card>
        <h2 className="mb-3 font-semibold">Rooms</h2>
        <div className="mb-3 flex flex-col gap-2">
          <Button className="w-full text-sm" onClick={() => setCreateModalOpen(true)}>
            New room
          </Button>
          <Link
            to="/app/rooms/join"
            className="block rounded-xl border border-slate-700 py-2 text-center text-sm hover:bg-slate-900"
          >
            Join with code
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          {sidebarRoomIds.map((id) => (
            <Link
              key={id}
              to={`/app/rooms/${encodeURIComponent(id)}`}
              className={`block rounded-lg px-3 py-2 break-all ${roomId === id ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-slate-800'}`}
            >
              {DEFAULT_ROOM_IDS.includes(id) ? id : roomLabels[id] || shortenRoomId(id)}
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <header className="mb-3 flex flex-wrap items-center gap-2">
          <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold">{currentRoom?.name || roomId}</h1>
            <Button
              variant="ghost"
              className="shrink-0 px-2 py-1 text-xs"
              onClick={() => {
                setRenameDraft(currentRoom?.name || roomId)
                setRenameModalOpen(true)
              }}
            >
              Rename
            </Button>
          </div>
          <span className="text-xs text-slate-400">Socket: {socketId || '...'}</span>
          <Link to={`/app/rooms/${encodeURIComponent(roomId)}/whiteboard`} className="rounded-lg border border-slate-700 px-3 py-1 text-sm">Whiteboard</Link>
          <Button variant="ghost" onClick={() => setUploadOpen(true)}>Attach</Button>
        </header>
        {currentRoom?.inviteCode && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs">
            <span className="text-slate-400">Invite code</span>
            <span className="font-mono font-semibold tracking-wider text-slate-100">{currentRoom.inviteCode}</span>
            <Button
              variant="ghost"
              className="ml-auto shrink-0 px-2 py-1 text-xs"
              onClick={() => copyInvite(currentRoom.inviteCode, 'Invite code copied.')}
            >
              Copy code
            </Button>
            <Button
              variant="ghost"
              className="shrink-0 px-2 py-1 text-xs"
              onClick={() => copyInvite(inviteLink, 'Room link copied.')}
            >
              Copy link
            </Button>
          </div>
        )}

        <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
          {!messages.length && (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
              No messages yet. Start the conversation.
            </div>
          )}
          <MessageFeed messages={messages} selfUserId={socketId} />
        </div>
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
      </Card>

      <div className="space-y-4">
        <UserPresencePanel users={users} />
        <Card>
          <h2 className="mb-3 font-semibold">Pinned Files</h2>
          <div className="space-y-2">
            {pinnedFiles.length === 0 && <p className="text-sm text-slate-400">No pinned files yet.</p>}
            {pinnedFiles.map((file) => (
              <div key={file.id} className="rounded-lg border border-slate-800 p-2 text-sm">
                <p>{file.name}</p>
                <p className="text-xs text-slate-400">{file.sender}</p>
              </div>
            ))}
          </div>
        </Card>
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
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setRenameModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={renameBusy} onClick={submitRename}>
            {renameBusy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <Modal open={uploadOpen} title="Upload file" onClose={() => setUploadOpen(false)}>
        <div className="rounded-xl border border-slate-700 p-4 text-sm text-slate-300">
          {selectedFile ? (
            <>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <p>No file selected.</p>
          )}
        </div>
        <Button
          className="mt-3 w-full"
          disabled={!selectedFile || uploading}
          onClick={handleUploadLocalFile}
        >
          {uploading ? 'Uploading...' : 'Upload from computer'}
        </Button>
      </Modal>

      <Modal
        open={driveOpen}
        title="Attach Google Drive file"
        onClose={() => setDriveOpen(false)}
      >
        <input
          value={driveUrl}
          onChange={(event) => setDriveUrl(event.target.value)}
          placeholder="Paste Google Drive share link"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {!/^\s*$/.test(driveUrl) && !/drive\.google\.com/.test(driveUrl) && (
          <p className="mt-2 text-xs text-rose-300">
            Please paste a valid Google Drive URL.
          </p>
        )}
        <Button className="mt-3 w-full" onClick={submitDriveAttachment}>
          Attach Drive Link
        </Button>
      </Modal>

      <Modal open={Boolean(inviteShare)} title="Room ready" onClose={dismissInviteShare}>
        <p className="text-sm text-slate-300">
          Share this code or link so friends can join <span className="font-medium text-slate-100">{inviteShare?.name}</span>.
        </p>
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
          <p className="text-xs text-slate-500">Invite code</p>
          <p className="font-mono text-lg font-semibold tracking-widest">{inviteShare?.inviteCode}</p>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => inviteShare?.inviteCode && copyInvite(inviteShare.inviteCode, 'Code copied.')}
          >
            Copy code
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() =>
              inviteShare &&
              copyInvite(
                `${window.location.origin}/app/rooms/${encodeURIComponent(roomId)}`,
                'Link copied.',
              )
            }
          >
            Copy link
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ChatPage
