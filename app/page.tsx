'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { InterviewActionPanel } from '@/app/components/interview-action-panel'
import { InterviewChatThread } from '@/app/components/interview-chat-thread'
import { InterviewHeader } from '@/app/components/interview-header'
import type {
  InterviewChoice,
  InterviewChoiceSource,
  InterviewInputMode,
  InterviewRequest,
  InterviewResult,
  InterviewTurn,
} from '@/lib/ai-adapter'
import { getFieldById, getMilestoneFields } from '@/lib/gks-schema'
import type { ApplicantProfile, ApplicationTrack, GksField, GksFieldId } from '@/lib/gks-schema'
import { isFieldAnswered, selectNextQuestion, updateProfileField } from '@/lib/interview-engine'
import { ProfileStore } from '@/lib/profile-store'
import { InterviewSessionStore } from '@/lib/interview-session-store'

type ChatMessage = {
  id: string
  role: 'system' | 'user'
  content: string
  fieldId?: GksFieldId
}

const HELP_TRIGGER = 'help me to fill up'

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const normalizeHelpTrigger = (value: string) => value.trim().toLowerCase() === HELP_TRIGGER


const toInterviewTurns = (messages: ChatMessage[]): InterviewTurn[] =>
  messages.map((message) => ({
    role: message.role === 'system' ? 'assistant' : 'user',
    content: message.content,
    fieldId: message.fieldId,
  }))

export default function SinglePageInterview() {
  const profileStore = useMemo(() => new ProfileStore(), [])
  const sessionStore = useMemo(() => new InterviewSessionStore(), [])

  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({})
  const [hasConsent, setHasConsent] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentField, setCurrentField] = useState<GksField | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputMode, setInputMode] = useState<InterviewInputMode>('text')
  const [choiceSource, setChoiceSource] = useState<InterviewChoiceSource>('none')
  const [choices, setChoices] = useState<InterviewChoice[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setProfile(profileStore.load())
    const session = sessionStore.load()
    setHasConsent(session.hasConsent)
    setIsStarted(session.isStarted)
    setIsComplete(session.isComplete)
    setCurrentField(session.currentFieldId ? getFieldById(session.currentFieldId) ?? null : null)
    setChatHistory(
      session.chatHistory.map((turn) => ({
        id: createMessageId(),
        role: turn.role === 'user' ? 'user' : 'system',
        content: turn.content,
        fieldId: turn.fieldId,
      })),
    )
    setCurrentInput(session.currentInput)
    setSelectedOptions(session.selectedOptions)
    setInputMode(session.inputMode)
    setChoiceSource(session.choiceSource)
    setChoices(session.choices)
  }, [profileStore, sessionStore])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  useEffect(() => {
    const currentFieldId = currentField ? (currentField.id as GksFieldId) : null

    sessionStore.save({
      hasConsent,
      isStarted,
      isComplete,
      currentFieldId,
      chatHistory: toInterviewTurns(chatHistory),
      currentInput,
      selectedOptions,
      inputMode,
      choiceSource,
      choices,
    })
  }, [chatHistory, choiceSource, choices, currentField, currentInput, hasConsent, inputMode, isComplete, isStarted, selectedOptions, sessionStore])

  const addSystemMessage = (content: string, fieldId?: GksFieldId) => {
    setChatHistory((prev) => [...prev, { id: createMessageId(), role: 'system', content, fieldId }])
  }

  const addUserMessage = (content: string) => {
    setChatHistory((prev) => [...prev, { id: createMessageId(), role: 'user', content }])
  }

  const applyUiConfig = (ui: InterviewResult['ui']) => {
    setInputMode(ui.inputMode)
    setChoiceSource(ui.choiceSource)
    setChoices(ui.choices)
    if (ui.inputMode !== 'multi_choice') {
      setSelectedOptions([])
    }
  }

  const resetInteractionState = () => {
    setCurrentInput('')
    setSelectedOptions([])
    setChoiceSource('none')
    setChoices([])
    setInputMode('text')
  }

  const loadNextQuestion = async (currentProfile: Partial<ApplicantProfile>) => {
    if (!currentProfile.applicationTrack) {
      return
    }

    setIsLoading(true)
    const nextField = selectNextQuestion(currentProfile, currentProfile.applicationTrack)

    if (!nextField) {
      setIsComplete(true)
      setCurrentField(null)
      resetInteractionState()
      addSystemMessage('Interview complete. All required fields have been collected.')
      setIsLoading(false)
      return
    }

    setCurrentField(nextField)
    resetInteractionState()

    try {
      const requestBody: InterviewRequest = {
        action: 'question',
        consent: hasConsent,
        fieldId: nextField.id as GksFieldId,
        profile: currentProfile,
        turns: toInterviewTurns(chatHistory),
      }

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = (await response.json()) as InterviewResult
      addSystemMessage(result.message, nextField.id as GksFieldId)
      applyUiConfig(result.ui)
    } catch {
      addSystemMessage(`Please provide your ${nextField.fieldLabel}.`, nextField.id as GksFieldId)
      setInputMode('text')
      setChoiceSource('none')
      setChoices([])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const requestAssistSuggestions = async () => {
    if (!currentField) {
      return
    }

    setIsLoading(true)

    try {
      const currentQuestion = [...chatHistory]
        .reverse()
        .find((message) => message.role === 'system' && message.fieldId === currentField.id)?.content

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assist',
          consent: hasConsent,
          fieldId: currentField.id as GksFieldId,
          profile,
          turns: toInterviewTurns(chatHistory),
          currentQuestion,
          maxSuggestions: 3,
        } satisfies InterviewRequest),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = (await response.json()) as InterviewResult
      const currentFieldId = currentField.id as GksFieldId

      if (result.currentField.id !== currentFieldId) {
        return
      }

      addSystemMessage(result.message, currentFieldId)
      applyUiConfig(result.ui)
      setCurrentInput('')
    } catch {
      addSystemMessage('I could not prepare suggestions right now. Please type your answer directly.', currentField.id as GksFieldId)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isStarted && profile.applicationTrack && !currentField && !isComplete && !isLoading) {
      void loadNextQuestion(profile)
    }
  }, [currentField, isComplete, isLoading, isStarted, profile])

  const handleStart = () => {
    setIsStarted(true)
    addSystemMessage('Initializing interview sequence...')
    setTimeout(() => {
      addSystemMessage('Please select your application track.')
    }, 200)
  }

  const handleTrackSelect = (track: ApplicationTrack) => {
    addUserMessage(track === 'embassy' ? 'Embassy Track' : 'University Track')
    const updatedProfile = updateProfileField(profile, 'form1.section1.applicationTrack', track)
    setProfile(updatedProfile)
    profileStore.save(updatedProfile as ApplicantProfile)
  }

  const handleChoiceSubmit = async (value: string) => {
    await handleSubmitAnswer(value)
  }

  const handleSubmitAnswer = async (answerOverride?: string | string[]) => {
    if (!currentField && !profile.applicationTrack) {
      return
    }

    let finalAnswer: string | string[] = ''

    if (answerOverride !== undefined) {
      finalAnswer = answerOverride
    } else if (inputMode === 'multi_choice') {
      finalAnswer = selectedOptions
    } else {
      finalAnswer = currentInput.trim()
    }

    if (!Array.isArray(finalAnswer) && normalizeHelpTrigger(finalAnswer)) {
      await requestAssistSuggestions()
      return
    }

    if (!finalAnswer || (Array.isArray(finalAnswer) && finalAnswer.length === 0)) {
      if (currentField?.status !== 'optional') {
        return
      }
    }

    const displayAnswer = Array.isArray(finalAnswer) ? finalAnswer.join(', ') : finalAnswer
    addUserMessage(displayAnswer || '[Skipped]')

    if (currentField) {
      const updatedProfile = updateProfileField(profile, currentField.id as GksFieldId, finalAnswer)
      setProfile(updatedProfile)
      profileStore.save(updatedProfile as ApplicantProfile)
      await loadNextQuestion(updatedProfile)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isSubmitDisabled) {
        void handleSubmitAnswer()
      }
    }
  }

  const milestoneFields = useMemo(() => {
    if (!profile.applicationTrack) {
      return []
    }

    return getMilestoneFields(profile.applicationTrack, profile)
  }, [profile])

  const answeredCount = useMemo(
    () => milestoneFields.filter((field) => isFieldAnswered(profile, field.id as GksFieldId)).length,
    [milestoneFields, profile],
  )

  const totalCount = milestoneFields.length

  const progressNodes = useMemo(() => {
    if (!profile.applicationTrack) {
      return []
    }

    const forms = new Set(milestoneFields.map((field) => field.formNumber))
    return Array.from(forms)
      .sort((left, right) => {
        if (left === 'checklist') return -1
        if (right === 'checklist') return 1
        return (left as number) - (right as number)
      })
      .map((formNum) => {
        const fieldsInForm = milestoneFields.filter((field) => field.formNumber === formNum)
        const answeredInForm = fieldsInForm.filter((field) => isFieldAnswered(profile, field.id as GksFieldId)).length
        return {
          id: formNum,
          isCurrent: currentField?.formNumber === formNum,
          isCompleted: answeredInForm === fieldsInForm.length && fieldsInForm.length > 0,
        }
      })
  }, [currentField, milestoneFields, profile])

  const isSubmitDisabled =
    inputMode === 'multi_choice'
      ? selectedOptions.length === 0 && currentField?.status === 'required'
      : !currentInput.trim() && currentField?.status !== 'optional'

  const inputFieldType: 'text' | 'date' | 'multiline' = currentField?.fieldType === 'multiline'
    ? 'multiline'
    : currentField?.fieldType === 'date'
      ? 'date'
      : 'text'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <InterviewHeader
        isVisible={isStarted && Boolean(profile.applicationTrack)}
        answeredCount={answeredCount}
        totalCount={totalCount}
        progressNodes={progressNodes}
      />

      <InterviewChatThread
        isStarted={isStarted}
        chatHistory={chatHistory}
        isLoading={isLoading}
        chatEndRef={chatEndRef}
      />

      <footer className="relative z-20 w-full border-t border-border/60 bg-gradient-to-t from-bg via-bg to-transparent px-4 pb-6 pt-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <InterviewActionPanel
            isStarted={isStarted}
            hasConsent={hasConsent}
            onConsentChange={setHasConsent}
            onStart={handleStart}
            hasTrack={Boolean(profile.applicationTrack)}
            onTrackSelect={handleTrackSelect}
            isComplete={isComplete}
            inputMode={inputMode}
            choiceSource={choiceSource}
            choices={choices}
            selectedOptions={selectedOptions}
            onToggleOption={(value) =>
              setSelectedOptions((prev) =>
                prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
              )
            }
            onConfirmMultiChoice={() => {
              void handleSubmitAnswer()
            }}
            onChoiceSubmit={(value) => {
              void handleChoiceSubmit(value)
            }}
            currentInput={currentInput}
            onInputChange={setCurrentInput}
            onKeyDown={handleKeyDown}
            onSubmit={() => {
              void handleSubmitAnswer()
            }}
            isSubmitDisabled={Boolean(isSubmitDisabled)}
            inputFieldType={inputFieldType}
            inputRef={inputRef}
            currentFieldOptional={currentField?.status === 'optional'}
          />
        </div>
      </footer>
    </div>
  )
}
