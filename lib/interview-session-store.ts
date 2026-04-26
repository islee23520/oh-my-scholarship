import { createStore } from 'zustand/vanilla'

import type {
  InterviewChoice,
  InterviewChoiceSource,
  InterviewInputMode,
  InterviewTurn,
} from '@/lib/ai-adapter'
import type { GksFieldId } from '@/lib/gks-schema'

export interface StoredInterviewSession {
  hasConsent: boolean
  isStarted: boolean
  isComplete: boolean
  currentFieldId: GksFieldId | null
  chatHistory: InterviewTurn[]
  currentInput: string
  selectedOptions: string[]
  inputMode: InterviewInputMode
  choiceSource: InterviewChoiceSource
  choices: InterviewChoice[]
}

const createEmptySession = (): StoredInterviewSession => ({
  hasConsent: false,
  isStarted: false,
  isComplete: false,
  currentFieldId: null,
  chatHistory: [],
  currentInput: '',
  selectedOptions: [],
  inputMode: 'text',
  choiceSource: 'none',
  choices: [],
})

type InterviewSessionState = {
  session: StoredInterviewSession
}

const interviewSessionStore = createStore<InterviewSessionState>(() => ({
  session: createEmptySession(),
}))

export class InterviewSessionStore {
  save(session: StoredInterviewSession) {
    interviewSessionStore.setState({ session })
  }

  load(): StoredInterviewSession {
    return interviewSessionStore.getState().session
  }

  reset() {
    interviewSessionStore.setState({ session: createEmptySession() })
  }
}
