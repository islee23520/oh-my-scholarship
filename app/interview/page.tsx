'use client'

import { useState, useEffect } from 'react'
import { ProfileStore } from '@/lib/profile-store'
import { selectNextQuestion, getDeterministicKoreanQuestion, updateProfileField } from '@/lib/interview-engine'
import type { ApplicantProfile, ApplicationTrack, GksField, GksFieldId } from '@/lib/gks-schema'
import type { InterviewRequest, InterviewResult } from '@/lib/ai-adapter'

export default function InterviewPage() {
  const [profileStore] = useState(() => new ProfileStore())
  
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({})
  const [hasConsent, setHasConsent] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  
  const [currentField, setCurrentField] = useState<GksField | null>(null)
  const [questionText, setQuestionText] = useState<string>('')
  const [isAiFallback, setIsAiFallback] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setProfile(profileStore.load())
  }, [profileStore])

  const handleStart = () => {
    setIsStarted(true)
  }

  const handleTrackSelect = (track: ApplicationTrack) => {
    const updatedProfile = updateProfileField(profile, 'form1.section1.applicationTrack', track)
    setProfile(updatedProfile)
    profileStore.save(updatedProfile as ApplicantProfile)
  }

  const loadNextQuestion = async (currentProfile: Partial<ApplicantProfile>) => {
    if (!currentProfile.applicationTrack) return;
    
    setIsLoading(true)
    const nextField = selectNextQuestion(currentProfile, currentProfile.applicationTrack)
    
    if (!nextField) {
      setIsComplete(true)
      setCurrentField(null)
      setIsLoading(false)
      return
    }

    setCurrentField(nextField)
    setIsAiFallback(false)
    setAnswer('')

    try {
      const requestBody: InterviewRequest = {
        consent: hasConsent,
        fieldId: nextField.id as GksFieldId,
        profile: currentProfile
      }

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = (await response.json()) as InterviewResult
      setQuestionText(result.question)
    } catch {
      setIsAiFallback(true)
      setQuestionText(getDeterministicKoreanQuestion(nextField))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isStarted && profile.applicationTrack && !currentField && !isComplete && !isLoading) {
      loadNextQuestion(profile)
    }
  }, [isStarted, profile.applicationTrack, currentField, isComplete, isLoading])

  const handleSubmitAnswer = async () => {
    if (!currentField) return
    
    const updatedProfile = updateProfileField(profile, currentField.id as GksFieldId, answer)
    setProfile(updatedProfile)
    profileStore.save(updatedProfile as ApplicantProfile)
    
    await loadNextQuestion(updatedProfile)
  }

  if (!isStarted) {
    return (
      <main>
        <h1>인터뷰 시작</h1>
        <label>
          <input 
            type="checkbox" 
            data-testid="consent-checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
          />
          개인정보 수집 및 AI 활용에 동의합니다.
        </label>
        <br />
        <button 
          data-testid="interview-start" 
          disabled={!hasConsent}
          onClick={handleStart}
        >
          시작하기
        </button>
      </main>
    )
  }

  if (!profile.applicationTrack) {
    return (
      <main>
        <h1>지원 트랙 선택</h1>
        <button onClick={() => handleTrackSelect('embassy')}>대사관 트랙 (Embassy Track)</button>
        <button onClick={() => handleTrackSelect('university')}>대학 트랙 (University Track)</button>
      </main>
    )
  }

  if (isComplete) {
    return (
      <main>
        <h1>인터뷰 완료</h1>
        <p>모든 질문에 답변하셨습니다. 감사합니다.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>인터뷰 진행 중</h1>
      {isLoading ? (
        <p>질문을 준비 중입니다...</p>
      ) : currentField ? (
        <div data-testid="next-question">
          {isAiFallback && (
            <div data-testid="ai-fallback-notice" style={{ color: 'red' }}>
              AI 서버 연결 지연으로 기본 질문을 표시합니다.
            </div>
          )}
          <p>{questionText}</p>
          <input 
            type="text" 
            data-testid="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button 
            data-testid="answer-submit"
            onClick={handleSubmitAnswer}
          >
            제출
          </button>
        </div>
      ) : null}
    </main>
  )
}
