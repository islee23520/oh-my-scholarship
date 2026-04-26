'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ApplicantProfile } from '@/lib/gks-schema'
import { ProfileStore } from '@/lib/profile-store'
import {
  buildDraftFailurePrompt,
  checkDraftSafety,
  persistAcceptedDraft,
  type DraftRequestBody,
  type EssayDraftFieldId,
} from '@/lib/essay-draft-service'
import type { DraftLanguage } from '@/lib/ai-adapter'

type DraftTarget = 'form2' | 'form3'

const DRAFT_LABEL = '초안 — 반드시 사용자가 검토/수정해야 함'

const getFieldIdForTarget = (target: DraftTarget): EssayDraftFieldId =>
  target === 'form2' ? 'form2.section1.personalStatement' : 'form3.section2.goalStudyPlan'

export default function DraftsPage() {
  const [profileStore] = useState(() => new ProfileStore())
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({})
  const [hasConsent, setHasConsent] = useState(false)
  const [userBullets, setUserBullets] = useState('')
  const [language, setLanguage] = useState<DraftLanguage>('korean')
  const [activeTarget, setActiveTarget] = useState<DraftTarget>('form2')
  const [draftText, setDraftText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fallbackPrompt, setFallbackPrompt] = useState('')
  const [acceptedMessage, setAcceptedMessage] = useState('')
  const [safetyFlags, setSafetyFlags] = useState<string[]>([])

  useEffect(() => {
    setProfile(profileStore.load())
  }, [profileStore])

  const activeFieldId = useMemo(() => getFieldIdForTarget(activeTarget), [activeTarget])

  const handleGenerate = async (target: DraftTarget) => {
    const fieldId = getFieldIdForTarget(target)
    setActiveTarget(target)
    setIsLoading(true)
    setErrorMessage('')
    setFallbackPrompt('')
    setAcceptedMessage('')

    try {
      const payload: DraftRequestBody = {
        consent: hasConsent,
        fieldId,
        profile,
        userBullets,
        language,
      }

      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(body?.message ?? `Draft API failed with status ${response.status}`)
      }

      const result = (await response.json()) as { draftText: string; language: DraftLanguage }
      const safety = checkDraftSafety(result.draftText)

      setDraftText(result.draftText)
      setSafetyFlags(safety.flags)
    } catch (error) {
      setDraftText('')
      setSafetyFlags([])
      setErrorMessage(error instanceof Error ? error.message : '초안 생성에 실패했습니다.')
      setFallbackPrompt(buildDraftFailurePrompt(fieldId, userBullets, language))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    const updatedProfile = persistAcceptedDraft(activeFieldId, draftText, profileStore)

    setProfile(updatedProfile)
    setAcceptedMessage('초안을 저장했습니다. 필요하면 다시 열어 수정할 수 있습니다.')
  }

  return (
    <main>
      <h1>에세이 초안 도우미</h1>
      <p>FORM 2 자기소개서와 FORM 3 학업계획서 초안을 생성합니다.</p>

      <label>
        <input
          type="checkbox"
          checked={hasConsent}
          onChange={(event) => setHasConsent(event.target.checked)}
        />
        확인된 프로필 사실과 아래 bullet을 AI 초안 생성에 사용하는 것에 동의합니다.
      </label>

      <div>
        <label htmlFor="draft-language">Draft language</label>{' '}
        <select
          id="draft-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as DraftLanguage)}
        >
          <option value="korean">Korean</option>
          <option value="english">English</option>
        </select>
      </div>

      <div>
        <label htmlFor="draft-bullets">User bullets</label>
        <textarea
          id="draft-bullets"
          value={userBullets}
          onChange={(event) => setUserBullets(event.target.value)}
          rows={8}
          placeholder="- 지원 동기&#10;- 관련 경험&#10;- 학업 목표"
        />
      </div>

      <div>
        <button
          data-testid="generate-form2-draft"
          disabled={!hasConsent || isLoading}
          onClick={() => handleGenerate('form2')}
        >
          FORM 2 초안 생성
        </button>{' '}
        <button
          data-testid="generate-form3-draft"
          disabled={!hasConsent || isLoading}
          onClick={() => handleGenerate('form3')}
        >
          FORM 3 초안 생성
        </button>
      </div>

      {isLoading ? <p>초안을 생성하는 중입니다...</p> : null}
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}

      {fallbackPrompt ? (
        <section>
          <h2>재시도 / 대체 프롬프트</h2>
          <pre data-testid="draft-fallback-prompt">{fallbackPrompt}</pre>
        </section>
      ) : null}

      {draftText ? (
        <section>
          <p>{DRAFT_LABEL}</p>
          {safetyFlags.length > 0 ? (
            <div role="alert">
              <p>안전 경고: 아래 표현은 삭제하거나 수정해야 합니다.</p>
              <ul>
                {safetyFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <textarea
            aria-label="Draft preview"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            rows={18}
          />
          <div>
            <button data-testid="accept-draft" onClick={handleAccept}>
              초안 수락 및 저장
            </button>
          </div>
        </section>
      ) : null}

      {acceptedMessage ? <p>{acceptedMessage}</p> : null}
    </main>
  )
}
