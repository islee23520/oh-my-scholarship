import { describe, expect, it } from 'vitest'

import { ConsentGatedAIAdapter, type AIService, type DraftFormType, type DraftLanguage, type DraftMode, type EssayFact } from './ai-adapter'
import {
  __internal__,
  buildDraftFailurePrompt,
  checkDraftSafety,
  generateDraft,
  persistAcceptedDraft,
} from './essay-draft-service'
import { PROFILE_STORAGE_KEY, ProfileStore, type ProfileStorageLike } from './profile-store'
import { validateLanguagePolicy } from './validation'

class RecordingProvider implements AIService {
  draftCalls: Array<{
    formType: DraftFormType
    facts: EssayFact[]
    draftMode: DraftMode
    language: DraftLanguage
  }> = []

  constructor(private readonly response = '초안 본문') {}

  async generateNextQuestion() {
    return 'unused'
  }

  async generateDraft(
    formType: DraftFormType,
    facts: EssayFact[],
    draftMode: DraftMode,
    language: DraftLanguage,
  ) {
    this.draftCalls.push({ formType, facts, draftMode, language })
    return this.response
  }
}

class FailingProvider implements AIService {
  async generateNextQuestion() {
    return 'unused'
  }

  async generateDraft(
    _formType: DraftFormType,
    _facts: EssayFact[],
    _draftMode: DraftMode,
    _language: DraftLanguage,
  ): Promise<string> {
    void _formType
    void _facts
    void _draftMode
    void _language
    throw new Error('provider failed')
  }
}

const createStorageMock = (): ProfileStorageLike => {
  const values = new Map<string, string>()

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

describe('essay-draft-service', () => {
  it('uses minimized and relevant facts only, excluding unrelated sensitive profile fields', async () => {
    const provider = new RecordingProvider('Korean draft text')
    const adapter = new ConsentGatedAIAdapter(provider)

    await generateDraft(
      'form2.section1.personalStatement',
      {
        applicationTrack: 'university',
        applicationType: 'uic',
        degree: 'bachelor',
        fieldOfStudy: ['ai'],
        email: 'private@example.com',
        address: 'Private Address',
        form6MedicalSample: { anyYes: true, explanation: 'Sensitive' },
        form2PersonalStatement: '기존 자기소개서',
      },
      '- 공공문제 해결에 관심이 있습니다.\n- 데이터 동아리 활동을 했습니다.',
      'korean',
      true,
      adapter,
    )

    const call = provider.draftCalls[0]
    const serializedFacts = JSON.stringify(call.facts)

    expect(call.formType).toBe('form2')
    expect(call.language).toBe('korean')
    expect(serializedFacts).toContain('applicationTrack')
    expect(serializedFacts).toContain('fieldOfStudy')
    expect(serializedFacts).toContain('기존 자기소개서')
    expect(serializedFacts).toContain('공공문제 해결에 관심이 있습니다.')
    expect(serializedFacts).not.toContain('private@example.com')
    expect(serializedFacts).not.toContain('Private Address')
    expect(serializedFacts).not.toContain('Sensitive')
  })

  it('flags drafts containing guaranteed acceptance claims', () => {
    expect(checkDraftSafety('This essay promises guaranteed acceptance.')).toEqual({
      safe: false,
      flags: ['acceptance guarantee claim'],
    })
  })

  it('flags drafts containing guaranteed admission claims', () => {
    expect(checkDraftSafety('This guarantees admission if you apply.')).toEqual({
      safe: false,
      flags: ['admission guarantee claim'],
    })
  })

  it('passes korean draft text through the korean-or-english validation path', async () => {
    const provider = new RecordingProvider('한국어 초안입니다.')
    const adapter = new ConsentGatedAIAdapter(provider)
    const result = await generateDraft(
      'form2.section1.personalStatement',
      {},
      '지원 동기와 경험을 정리했습니다.',
      'korean',
      true,
      adapter,
    )

    expect(result.language).toBe('korean')
    expect(validateLanguagePolicy(result.draftText, 'korean-or-english')).toEqual([])
  })

  it('provides a retry and fallback prompt when AI generation fails', async () => {
    const adapter = new ConsentGatedAIAdapter(new FailingProvider())

    await expect(
      generateDraft(
        'form3.section2.goalStudyPlan',
        {},
        '- 한국어 역량 향상\n- AI 정책 연구',
        'english',
        true,
        adapter,
      ),
    ).rejects.toThrow('provider failed')

    const prompt = buildDraftFailurePrompt(
      'form3.section2.goalStudyPlan',
      '- 한국어 역량 향상\n- AI 정책 연구',
      'english',
    )

    expect(prompt).toContain('AI draft generation failed')
    expect(prompt).toContain('Language Study Plan')
    expect(prompt).toContain('AI 정책 연구')
  })

  it('does not persist a draft until accept is explicitly invoked', () => {
    const storage = createStorageMock()
    const store = new ProfileStore(storage)
    const draftText = '초안 — 아직 저장되지 않음'

    const previewFacts = __internal__.buildDraftFacts(
      'form2.section1.personalStatement',
      { email: 'secret@example.com' },
      '- 동기',
      'korean',
    )

    expect(previewFacts.facts.length).toBeGreaterThan(0)
    expect(store.load().form2PersonalStatement).toBeUndefined()

    persistAcceptedDraft('form2.section1.personalStatement', draftText, store)

    expect(store.load().form2PersonalStatement).toBe(draftText)
    expect(JSON.parse(storage.getItem(PROFILE_STORAGE_KEY) ?? '{}').profile.form2PersonalStatement).toBe(
      draftText,
    )
  })

  it('splits and persists accepted form3 drafts into the three stored fields', () => {
    const storage = createStorageMock()
    const store = new ProfileStore(storage)

    persistAcceptedDraft(
      'form3.section2.goalStudyPlan',
      'Language Study Plan:\nImprove Korean fluency.\n\nGoal and Study Plan:\nStudy AI policy.\n\nFuture Plan:\nWork in public service.',
      store,
    )

    expect(store.load().form3StudyPlan).toEqual({
      languageStudyPlan: 'Improve Korean fluency.',
      goalStudyPlan: 'Study AI policy.',
      futurePlan: 'Work in public service.',
    })
  })
})
