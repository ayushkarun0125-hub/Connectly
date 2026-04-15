import ChatMessageItem from './connectly/ChatMessageItem'

function MessageFeed({ messages, selfUserId, onPinAttachment, onReportMessage }) {
  return (
    <div className="flex flex-col">
      {messages.map((message, i) => {
        const prev = messages[i - 1]
        const sameAuthor =
          prev &&
          prev.userId === message.userId &&
          (prev.username || '') === (message.username || '')
        const compact = Boolean(sameAuthor)
        return (
          <ChatMessageItem
            key={message.id}
            message={message}
            selfUserId={selfUserId}
            compact={compact}
            onPinAttachment={onPinAttachment}
            onReport={onReportMessage}
          />
        )
      })}
    </div>
  )
}

export default MessageFeed
