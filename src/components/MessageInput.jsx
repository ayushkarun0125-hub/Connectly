import { useRef } from 'react'
import { Cloud, Paperclip, Send } from 'lucide-react'
import { cn } from '../lib/utils'

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
      className="mt-3 shrink-0 rounded-[22px] border border-slate-200/90 bg-white p-2 shadow-lg shadow-slate-900/10 dark:border-white/[0.08] dark:bg-[#0d1729] dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex items-end gap-1.5">
        <div className="flex shrink-0 items-center gap-0.5 pb-1 pl-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onChooseDriveLink}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
            title="Attach Google Drive link"
            aria-label="Attach Google Drive link"
          >
            <Cloud className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
        <textarea
          rows={1}
          className={cn(
            'max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] leading-snug text-slate-100 placeholder:text-slate-500 outline-none',
          )}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className={cn(
            'mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white',
            'shadow-[0_0_24px_-4px_rgba(59,130,246,0.65)] transition hover:bg-blue-500 hover:shadow-[0_0_28px_-2px_rgba(59,130,246,0.75)]',
            'active:scale-95 disabled:opacity-40',
          )}
          title="Send"
          aria-label="Send message"
        >
          <Send className="h-[18px] w-[18px]" strokeWidth={2} />
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
      </div>
      <p className="flex items-center gap-1.5 px-3 pb-1.5 pt-0 text-[11px] text-slate-500 dark:text-slate-600">
        <Paperclip className="h-3 w-3 shrink-0 opacity-50" strokeWidth={2} />
        <span>
          <span className="text-slate-500">Enter</span> to send ·{' '}
          <span className="text-slate-500">Shift + Enter</span> for new line
        </span>
      </p>
    </form>
  )
}

export default MessageInput
