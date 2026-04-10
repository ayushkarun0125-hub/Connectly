function TypingIndicator({ usernames }) {
  if (!usernames.length) return <div className="min-h-5" aria-hidden />

  return (
    <p className="min-h-5 text-xs italic text-slate-500">
      <span className="inline-flex items-center gap-1">
        <span className="flex gap-0.5">
          <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400" />
        </span>
        <span>
          {usernames.join(', ')} {usernames.length > 1 ? 'are' : 'is'} typing…
        </span>
      </span>
    </p>
  )
}

export default TypingIndicator
