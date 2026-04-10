function MessageFeed({ messages, selfUserId }) {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

  function renderContent(message) {
    if (message.type === 'drive-link') {
      return (
        <a
          href={message.content}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-300 underline break-all"
        >
          Google Drive Attachment
        </a>
      )
    }

    if (message.type === 'file') {
      const href = message.url?.startsWith('/uploads')
        ? `${serverUrl}${message.url}`
        : message.url
      return (
        <a
          href={href || '#'}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-emerald-300 underline break-all"
        >
          {message.filename || message.content || 'Attached file'}
        </a>
      )
    }

    return <p className="text-sm break-words">{message.content}</p>
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const mine = message.userId === selfUserId
        return (
          <article
            key={message.id}
            className={`rounded-lg border p-3 ${
              mine
                ? 'bg-blue-600/20 border-blue-600/30'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <header className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium">{message.username || 'Unknown'}</span>
              <span className="text-slate-400">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </header>
            {renderContent(message)}
          </article>
        )
      })}
    </div>
  )
}

export default MessageFeed
