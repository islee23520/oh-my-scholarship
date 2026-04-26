import type { ApplicantProfile, GksFieldId } from './gks-schema'
import {
  ConsentGatedAIAdapter,
  MockAIProvider,
  minimizePayload,
  type AIService,
  type DraftFormType,
  type DraftMode,
  type EssayFact,
  type ValidationContext,
} from './ai-adapter'

class RecordingProvider implements AIService {
  nextQuestionCalls: Array<{
    fieldId: GksFieldId
    currentAnswer?: string
    validationContext?: ValidationContext
  }> = []

  draftCalls: Array<{
    formType: DraftFormType
    facts: EssayFact[]
    draftMode: DraftMode
  }> = []

  async generateNextQuestion(
    fieldId: GksFieldId,
    currentAnswer?: string,
    validationContext?: ValidationContext,
  ) {
    this.nextQuestionCalls.push({ fieldId, currentAnswer, validationContext })
    return '기록된 다음 질문'
  }

  async generateDraft(formType: DraftFormType, facts: EssayFact[], draftMode: DraftMode) {
    this.draftCalls.push({ formType, facts, draftMode })
    return '기록된 초안'
  }
}

describe('ai-adapter', () => {
  it('blocks provider calls when consent is false', async () => {
    const provider = new RecordingProvider()
    const adapter = new ConsentGatedAIAdapter(provider)

    await expect(
      adapter.generateInterviewQuestion({
        consent: false,
        fieldId: 'form2.section1.personalStatement',
        currentAnswer: '저는 컴퓨터공학을 공부했습니다.',
      }),
    ).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
    })

    expect(provider.nextQuestionCalls).toHaveLength(0)
  })

  it('returns deterministic Korean text from the mock provider when consent is true', async () => {
    const adapter = new ConsentGatedAIAdapter(new MockAIProvider())

    const result = await adapter.generateInterviewQuestion({
      consent: true,
      fieldId: 'form3.section2.goalStudyPlan',
      currentAnswer: '인공지능 정책 연구를 하고 싶습니다.',
    })

    expect(result.question).toBe(
      '다음 질문입니다. Goal and Study Plan 항목을 위해 구체적으로 설명해 주세요. 현재 답변은 "인공지능 정책 연구를 하고 싶습니다."입니다.',
    )
  })

  it('minimizes payload to the active field context only', () => {
    const profile: Partial<ApplicantProfile> = {
      applicationTrack: 'university',
      applicationType: 'uic',
      degree: 'bachelor',
      email: 'student@example.com',
      address: 'Seoul',
      form2PersonalStatement: '어린 시절부터 공공정책에 관심이 있었습니다.',
      form3StudyPlan: {
        languageStudyPlan: '입학 후 한국어를 집중적으로 배우겠습니다.',
        goalStudyPlan: 'AI 거버넌스 연구를 수행하겠습니다.',
        futurePlan: '국제기구에서 일하고 싶습니다.',
      },
      education: {
        highSchoolName: 'Global High School',
      },
    }

    const minimized = minimizePayload(profile, 'form3.section2.goalStudyPlan')

    expect(minimized.profileExcerpt).toEqual({
      form3StudyPlan: {
        goalStudyPlan: 'AI 거버넌스 연구를 수행하겠습니다.',
      },
    })
    expect(minimized.profileExcerpt).not.toHaveProperty('email')
    expect(minimized.profileExcerpt).not.toHaveProperty('form2PersonalStatement')
    expect(minimized.profileExcerpt).not.toHaveProperty('education')
  })

  it('passes only explicitly selected facts into draft generation', async () => {
    const provider = new RecordingProvider()
    const adapter = new ConsentGatedAIAdapter(provider)

    await adapter.generateEssayDraft({
      consent: true,
      formType: 'form2',
      draftMode: 'outline',
      facts: [
        { id: 'fact-1', label: '동기', value: '기술로 공공문제를 해결하고 싶음' },
        { id: 'fact-2', label: '경험', value: '청소년 데이터 봉사활동 2년' },
      ],
    })

    expect(provider.draftCalls).toEqual([
      {
        formType: 'form2',
        draftMode: 'outline',
        facts: [
          { id: 'fact-1', label: '동기', value: '기술로 공공문제를 해결하고 싶음' },
          { id: 'fact-2', label: '경험', value: '청소년 데이터 봉사활동 2년' },
        ],
      },
    ])
  })
})
