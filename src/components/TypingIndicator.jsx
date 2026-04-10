function TypingIndicator({ usernames }) {
  if (!usernames.length) return null

  return (
    <p className="text-xs text-slate-400 min-h-5">
      {usernames.join(', ')} {usernames.length > 1 ? 'are' : 'is'} typing...
    </p>
  )
}

export default TypingIndicator
