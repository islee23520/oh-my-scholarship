import type { RefObject } from 'react'

import type { InterviewChoice, InterviewChoiceSource, InterviewInputMode } from '@/lib/ai-adapter'

export function InterviewActionPanel({
  isStarted,
  hasConsent,
  onConsentChange,
  onStart,
  hasTrack,
  onTrackSelect,
  isComplete,
  inputMode,
  choiceSource,
  choices,
  selectedOptions,
  onToggleOption,
  onConfirmMultiChoice,
  onChoiceSubmit,
  currentInput,
  onInputChange,
  onKeyDown,
  onSubmit,
  isSubmitDisabled,
  inputFieldType,
  inputRef,
  currentFieldOptional,
}: {
  isStarted: boolean
  hasConsent: boolean
  onConsentChange: (checked: boolean) => void
  onStart: () => void
  hasTrack: boolean
  onTrackSelect: (track: 'embassy' | 'university') => void
  isComplete: boolean
  inputMode: InterviewInputMode
  choiceSource: InterviewChoiceSource
  choices: InterviewChoice[]
  selectedOptions: string[]
  onToggleOption: (value: string) => void
  onConfirmMultiChoice: () => void
  onChoiceSubmit: (value: string) => void
  currentInput: string
  onInputChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: () => void
  isSubmitDisabled: boolean
  inputFieldType: 'text' | 'date' | 'multiline'
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  currentFieldOptional: boolean
}) {
  const renderPreStart = () => {
    if (!isStarted) {
      return (
        <div className="flex w-full max-w-2xl flex-col gap-3">
          <label className="flex items-center gap-3 rounded-2xl bg-[#f4f4f4] p-4 text-sm text-text transition-colors hover:bg-[#ececec]">
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer accent-accent"
              checked={hasConsent}
              onChange={(event) => onConsentChange(event.target.checked)}
            />
            I consent to data collection and AI processing.
          </label>
          <button
            className="rounded-2xl bg-text px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasConsent}
            onClick={onStart}
          >
            Start interview
          </button>
        </div>
      )
    }

    if (!hasTrack) {
      return (
        <div className="flex w-full max-w-2xl flex-wrap gap-2">
          <button
            className="min-w-[160px] flex-1 rounded-2xl bg-[#f4f4f4] px-4 py-3 text-sm text-text transition-colors hover:bg-[#ececec]"
            onClick={() => onTrackSelect('embassy')}
          >
            Embassy Track
          </button>
          <button
            className="min-w-[160px] flex-1 rounded-2xl bg-[#f4f4f4] px-4 py-3 text-sm text-text transition-colors hover:bg-[#ececec]"
            onClick={() => onTrackSelect('university')}
          >
            University Track
          </button>
        </div>
      )
    }

    return null
  }

  const preStart = renderPreStart()
  if (preStart) {
    return <>{preStart}</>
  }

  if (isComplete) {
    return null
  }

  if (choices.length > 0) {
    return (
      <div className="flex w-full max-w-3xl flex-col gap-3">
        {choiceSource === 'ai_assist' ? (
          <div className="text-xs text-text-muted">AI suggestions for this answer</div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {choices.map((choice) => {
            const isSelected = selectedOptions.includes(choice.value)
            return (
              <button
                key={choice.id}
                className={`min-w-[120px] rounded-2xl px-4 py-2 text-sm transition-colors ${
                  isSelected ? 'bg-text text-bg' : 'bg-[#f4f4f4] text-text hover:bg-[#ececec]'
                }`}
                onClick={() =>
                  inputMode === 'multi_choice' ? onToggleOption(choice.value) : onChoiceSubmit(choice.value)
                }
              >
                {choice.label}
              </button>
            )
          })}
        </div>
        {inputMode === 'multi_choice' ? (
          <button
            className="rounded-2xl bg-text px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirmMultiChoice}
            disabled={selectedOptions.length === 0}
          >
            Confirm selection
          </button>
        ) : null}
      </div>
    )
  }

  if (inputMode !== 'text') {
    return null
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-2 text-xs text-text-muted">
        Tip: type <span className="font-medium text-text">help me to fill up</span> to get AI answer suggestions.
      </div>
      <div className="relative flex items-end overflow-hidden rounded-2xl border border-border bg-[#f4f4f4] focus-within:border-accent">
        {inputFieldType === 'multiline' ? (
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            className="min-h-[56px] w-full resize-y bg-transparent p-4 pr-14 text-base text-text outline-none"
            value={currentInput}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
            rows={1}
          />
        ) : inputFieldType === 'date' ? (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            type="date"
            className="h-[56px] w-full bg-transparent p-4 pr-14 text-base text-text outline-none"
            value={currentInput}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
          />
        ) : (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            type="text"
            className="h-[56px] w-full bg-transparent p-4 pr-14 text-base text-text outline-none"
            value={currentInput}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
          />
        )}
        <button
          className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-text text-bg transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.2.478 2.404Z" />
          </svg>
        </button>
      </div>
      {currentFieldOptional ? <div className="mt-2 text-right text-xs text-text-muted">Optional — press send to skip.</div> : null}
    </div>
  )
}
