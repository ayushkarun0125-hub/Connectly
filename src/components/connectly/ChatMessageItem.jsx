import { FileText, Link2, Pin } from 'lucide-react'
import { cn } from '../../lib/utils'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function ChatMessageItem({ message, selfUserId, compact, onPinAttachment }) {
  const mine = message.userId === selfUserId
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
  const initial = (message.username || '?').slice(0, 1).toUpperCase()

  const canPin =
    typeof onPinAttachment === 'function' && (message.type === 'file' || message.type === 'drive-link')

  function pinPayload() {
    if (message.type === 'drive-link') {
      return {
        name: 'Google Drive link',
        url: message.content,
        messageId: message.id,
        sender: message.username,
      }
    }
    if (message.type === 'file') {
      const href = message.url?.startsWith('/uploads') ? `${API_BASE}${message.url}` : message.url
      return {
        name: message.filename || message.content || 'Attached file',
        url: href || '#',
        messageId: message.id,
        sender: message.username,
      }
    }
    return null
  }

  function body() {
    if (message.type === 'drive-link') {
      return (
        <a
          href={message.content}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[15px] font-medium text-blue-600 underline-offset-2 hover:text-blue-500 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
        >
          <Link2 className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
          Google Drive link
        </a>
      )
    }
    if (message.type === 'file') {
      const href = message.url?.startsWith('/uploads') ? `${API_BASE}${message.url}` : message.url
      return (
        <a
          href={href || '#'}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[15px] font-medium text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          <FileText className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
          {message.filename || message.content || 'Attached file'}
        </a>
      )
    }
    return (
      <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.55] text-slate-800 dark:text-slate-200">
        {message.content}
      </p>
    )
  }

  return (
    <article
      className={cn(
        'group relative rounded-lg px-2 py-0.5 transition-colors',
        'hover:bg-slate-200/60 dark:hover:bg-white/[0.04]',
        mine && 'hover:bg-blue-100/80 dark:hover:bg-blue-500/[0.06]',
        compact ? 'mt-0.5' : 'mt-3 first:mt-0',
      )}
    >
      <div className={cn(!compact && 'flex gap-3', compact && 'pl-11')}>
        {!compact ? (
          <div
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white',
              mine
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_-6px_rgba(59,130,246,0.8)]'
                : 'bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800',
            )}
            aria-hidden
          >
            {initial}
          </div>
        ) : null}
        <div className="min-w-0 flex-1 pb-1 pt-0.5">
          {!compact ? (
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
              <span className="text-[15px] font-semibold text-slate-900 dark:text-white">
                {message.username || 'Unknown'}
              </span>
              <time
                className="text-[11px] font-medium tabular-nums text-slate-500 opacity-90 group-hover:opacity-100 dark:text-slate-500"
                dateTime={message.timestamp}
              >
                {time}
              </time>
              {canPin ? (
                <button
                  type="button"
                  title="Pin to room"
                  onClick={() => {
                    const p = pinPayload()
                    if (p) onPinAttachment(p)
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-500 opacity-0 transition hover:bg-slate-200/80 hover:text-blue-600 group-hover:opacity-100 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-blue-300"
                >
                  <Pin className="h-3 w-3" strokeWidth={2} />
                  Pin
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-start gap-2">
            <div className={cn('min-w-0 flex-1', mine && 'text-slate-900 dark:text-slate-100')}>{body()}</div>
            {compact && canPin ? (
              <button
                type="button"
                title="Pin to room"
                onClick={() => {
                  const p = pinPayload()
                  if (p) onPinAttachment(p)
                }}
                className="mt-0.5 shrink-0 rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-200/80 hover:text-blue-600 group-hover:opacity-100 dark:hover:bg-white/[0.08] dark:hover:text-blue-300"
              >
                <Pin className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default ChatMessageItem
