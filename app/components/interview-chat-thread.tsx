import type { RefObject } from 'react'

interface ChatMessage {
  id: string
  role: 'system' | 'user'
  content: string
  fieldId?: string
}

export function InterviewChatThread({
  isStarted,
  chatHistory,
  isLoading,
  chatEndRef,
}: {
  isStarted: boolean
  chatHistory: ChatMessage[]
  isLoading: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <main className="flex flex-1 overflow-y-auto px-4 py-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-32">
        {!isStarted ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-semibold text-text sm:text-4xl">oh-my-scholarship</h1>
            <p className="max-w-md text-sm leading-relaxed text-text-muted">
              AI-guided application interview for scholarship applicants. Data is kept only in memory for this tab.
            </p>
          </div>
        ) : null}

        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[76%] sm:text-base ${
                msg.role === 'user' ? 'bg-[#f4f4f4] text-text shadow-sm' : 'bg-transparent text-text'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading ? (
          <div className="flex w-full justify-start">
            <div className="flex items-center gap-2 px-2 py-3 text-text-muted">
              <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '0.15s' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        ) : null}

        <div ref={chatEndRef} />
      </div>
    </main>
  )
}
