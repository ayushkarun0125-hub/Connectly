import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { createRoomApi, persistRoomLabelToStorage } from '../services/roomService'
import { useAppStore } from '../store/useAppStore'

function CreateRoomModal({ open, onClose, onCreated }) {
  const pushToast = useAppStore((state) => state.pushToast)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setName('')
  }, [open])

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const trimmed = name.trim()
      const displayName = trimmed || 'New room'
      const created = await createRoomApi(displayName)
      persistRoomLabelToStorage(created.id, created.name)
      onCreated(created)
      onClose()
    } catch {
      pushToast({
        title: 'Could not create room',
        description: 'Start the API server and confirm VITE_SERVER_URL matches its port.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="New room" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="create-room-name" className="mb-1 block text-xs text-slate-400">
            Room name
          </label>
          <input
            id="create-room-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Study group"
            maxLength={80}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateRoomModal
