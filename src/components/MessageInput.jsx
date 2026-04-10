import { useRef } from 'react'

function MessageInput({
  value,
  onChange,
  onSubmit,
  onTyping,
  onChooseLocalFile,
  onChooseDriveLink,
}) {
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <input
        className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          onTyping('start')
          if (timerRef.current) {
            clearTimeout(timerRef.current)
          }
          timerRef.current = setTimeout(() => {
            onTyping('stop')
          }, 1500)
        }}
        placeholder="Type a message"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"
      >
        File
      </button>
      <button
        type="button"
        onClick={onChooseDriveLink}
        className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"
      >
        Drive
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onChooseLocalFile(file)
          event.target.value = ''
        }}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
      >
        Send
      </button>
    </form>
  )
}

export default MessageInput
