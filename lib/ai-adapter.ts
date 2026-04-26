import { getFieldById, type ApplicantProfile, type GksFieldId } from './gks-schema'

export type ValidationContext = Readonly<{
  track?: ApplicantProfile['applicationTrack']
  applicationType?: ApplicantProfile['applicationType']
  degree?: ApplicantProfile['degree']
  fieldLabel?: string
  sectionLabel?: string
  sourceLabel?: string
  fieldType?: string
  status?: string
  languagePolicy?: string
  validation?: Record<string, unknown>
}>

export type DraftFormType = 'form2' | 'form3'

export type DraftMode = 'outline' | 'polished'

export type DraftLanguage = 'korean' | 'english'

export interface EssayFact {
  id: string
  label: string
  value: string
}

export interface AIService {
  generateNextQuestion(
    fieldId: GksFieldId,
    currentAnswer?: string,
    validationContext?: ValidationContext,
  ): Promise<string>
  generateDraft(
    formType: DraftFormType,
    facts: EssayFact[],
    draftMode: DraftMode,
    language: DraftLanguage,
  ): Promise<string>
}

export class ConsentRequiredError extends Error {
  readonly code = 'CONSENT_REQUIRED'

  constructor(message = 'Explicit consent is required before sending AI requests.') {
    super(message)
    this.name = 'ConsentRequiredError'
  }
}

export class ConsentManager {
  readonly hasConsent: boolean

  constructor(hasConsent: boolean) {
    this.hasConsent = hasConsent
  }

  assertAllowed() {
    if (!this.hasConsent) {
      throw new ConsentRequiredError()
    }
  }
}

export interface MinimizedFieldContext {
  fieldId: GksFieldId
  fieldLabel: string
  sectionLabel: string
  sourceLabel: string
  fieldType: string
  status: string
  languagePolicy: string
  validation: Record<string, unknown>
  profileExcerpt: Record<string, unknown>
}

const extractValueForField = (
  profile: Partial<ApplicantProfile>,
  fieldId: GksFieldId,
): Record<string, unknown> => {
  switch (fieldId) {
    case 'form1.section1.applicationTrack':
      return { applicationTrack: profile.applicationTrack }
    case 'form1.section2.applicationType':
      return { applicationType: profile.applicationType }
    case 'form1.section3.degree':
      return { degree: profile.degree }
    case 'form1.section4.fieldOfStudy':
      return { fieldOfStudy: profile.fieldOfStudy }
    case 'form1.section5.familyName':
      return { fullNameEnglish: { familyName: profile.fullNameEnglish?.familyName } }
    case 'form1.section5.givenName':
      return { fullNameEnglish: { givenName: profile.fullNameEnglish?.givenName } }
    case 'form1.section5.middleName':
      return { fullNameEnglish: { middleName: profile.fullNameEnglish?.middleName } }
    case 'form1.section5.dateOfBirth':
      return { dateOfBirth: profile.dateOfBirth }
    case 'form1.section5.gender':
      return { gender: profile.gender }
    case 'form1.section5.citizenship':
      return { citizenship: profile.citizenship }
    case 'form1.section5.koreanCitizenshipApplicant':
      return { koreanCitizenshipApplicant: profile.koreanCitizenshipApplicant }
    case 'form1.section5.koreanCitizenshipParents':
      return { koreanCitizenshipParents: profile.koreanCitizenshipParents }
    case 'form1.section5.address':
      return { address: profile.address }
    case 'form1.section5.phone':
      return { phone: profile.phone }
    case 'form1.section5.email':
      return { email: profile.email }
    case 'form1.section6.topikLevel':
      return { topikLevel: profile.topikLevel }
    case 'form1.section7.highSchoolName':
      return { education: { highSchoolName: profile.education?.highSchoolName } }
    case 'form1.section7.highSchoolLocation':
      return { education: { highSchoolLocation: profile.education?.highSchoolLocation } }
    case 'form1.section7.highSchoolPeriod':
      return { education: { highSchoolPeriod: profile.education?.highSchoolPeriod } }
    case 'form1.section7.highSchoolGraduationDate':
      return {
        education: { highSchoolGraduationDate: profile.education?.highSchoolGraduationDate },
      }
    case 'form1.section7.associateInstitutionName':
      return {
        education: { associateInstitutionName: profile.education?.associateInstitutionName },
      }
    case 'form1.section7.associateInstitutionLocation':
      return {
        education: { associateInstitutionLocation: profile.education?.associateInstitutionLocation },
      }
    case 'form1.section7.associateInstitutionPeriod':
      return {
        education: { associateInstitutionPeriod: profile.education?.associateInstitutionPeriod },
      }
    case 'form1.section7.associateInstitutionGraduationDate':
      return {
        education: {
          associateInstitutionGraduationDate:
            profile.education?.associateInstitutionGraduationDate,
        },
      }
    case 'form1.section9.embassyChoice1.university':
      return {
        universityChoices: {
          embassyChoices: [{ university: profile.universityChoices?.embassyChoices?.[0]?.university }],
        },
      }
    case 'form1.section9.embassyChoice1.fieldOfStudy':
      return {
        universityChoices: {
          embassyChoices: [
            { fieldOfStudy: profile.universityChoices?.embassyChoices?.[0]?.fieldOfStudy },
          ],
        },
      }
    case 'form1.section9.embassyChoice1.department':
      return {
        universityChoices: {
          embassyChoices: [{ department: profile.universityChoices?.embassyChoices?.[0]?.department }],
        },
      }
    case 'form1.section9.embassyChoice1.other':
      return {
        universityChoices: {
          embassyChoices: [{ other: profile.universityChoices?.embassyChoices?.[0]?.other }],
        },
      }
    case 'form1.section9.embassyChoice2.university':
      return {
        universityChoices: {
          embassyChoices: [{}, { university: profile.universityChoices?.embassyChoices?.[1]?.university }],
        },
      }
    case 'form1.section9.embassyChoice2.fieldOfStudy':
      return {
        universityChoices: {
          embassyChoices: [
            {},
            { fieldOfStudy: profile.universityChoices?.embassyChoices?.[1]?.fieldOfStudy },
          ],
        },
      }
    case 'form1.section9.embassyChoice2.department':
      return {
        universityChoices: {
          embassyChoices: [{}, { department: profile.universityChoices?.embassyChoices?.[1]?.department }],
        },
      }
    case 'form1.section9.embassyChoice2.other':
      return {
        universityChoices: {
          embassyChoices: [{}, { other: profile.universityChoices?.embassyChoices?.[1]?.other }],
        },
      }
    case 'form1.section9.embassyChoice3.university':
      return {
        universityChoices: {
          embassyChoices: [
            {},
            {},
            { university: profile.universityChoices?.embassyChoices?.[2]?.university },
          ],
        },
      }
    case 'form1.section9.embassyChoice3.fieldOfStudy':
      return {
        universityChoices: {
          embassyChoices: [
            {},
            {},
            { fieldOfStudy: profile.universityChoices?.embassyChoices?.[2]?.fieldOfStudy },
          ],
        },
      }
    case 'form1.section9.embassyChoice3.department':
      return {
        universityChoices: {
          embassyChoices: [
            {},
            {},
            { department: profile.universityChoices?.embassyChoices?.[2]?.department },
          ],
        },
      }
    case 'form1.section9.embassyChoice3.other':
      return {
        universityChoices: {
          embassyChoices: [{}, {}, { other: profile.universityChoices?.embassyChoices?.[2]?.other }],
        },
      }
    case 'form1.section9.universityChoice.university':
      return {
        universityChoices: {
          universityChoice: { university: profile.universityChoices?.universityChoice?.university },
        },
      }
    case 'form1.section9.universityChoice.fieldOfStudy':
      return {
        universityChoices: {
          universityChoice: {
            fieldOfStudy: profile.universityChoices?.universityChoice?.fieldOfStudy,
          },
        },
      }
    case 'form1.section9.universityChoice.department':
      return {
        universityChoices: {
          universityChoice: { department: profile.universityChoices?.universityChoice?.department },
        },
      }
    case 'form1.section9.universityChoice.other':
      return {
        universityChoices: {
          universityChoice: { other: profile.universityChoices?.universityChoice?.other },
        },
      }
    case 'form2.section1.personalStatement':
      return { form2PersonalStatement: profile.form2PersonalStatement }
    case 'form3.section1.languageStudyPlan':
      return {
        form3StudyPlan: { languageStudyPlan: profile.form3StudyPlan?.languageStudyPlan },
      }
    case 'form3.section2.goalStudyPlan':
      return {
        form3StudyPlan: { goalStudyPlan: profile.form3StudyPlan?.goalStudyPlan },
      }
    case 'form3.section3.futurePlan':
      return { form3StudyPlan: { futurePlan: profile.form3StudyPlan?.futurePlan } }
    case 'form5.section1.consentGroup':
      return {
        form5ConsentGroup: {
          agreementsAccepted: profile.form5ConsentGroup?.agreementsAccepted,
        },
      }
    case 'form6.section1.medicalChecklist':
      return {
        form6MedicalSample: {
          answers: profile.form6MedicalSample?.answers,
          anyYes: profile.form6MedicalSample?.anyYes,
        },
      }
    default:
      return {}
  }
}

const stripUndefined = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const sanitized = value.map(stripUndefined).filter((entry) => entry !== undefined)
    return sanitized.length > 0 ? sanitized : undefined
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).flatMap(([key, nestedValue]) => {
      const sanitized = stripUndefined(nestedValue)
      return sanitized === undefined ? [] : [[key, sanitized] as const]
    })

    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }

  return value === undefined ? undefined : value
}

export const minimizePayload = (
  profile: Partial<ApplicantProfile>,
  currentFieldId: GksFieldId,
): MinimizedFieldContext => {
  const field = getFieldById(currentFieldId)

  if (!field) {
    throw new Error(`Unknown field ID: ${currentFieldId}`)
  }

  const profileExcerpt =
    (stripUndefined(extractValueForField(profile, currentFieldId)) as Record<string, unknown>) ?? {}

  return {
    fieldId: currentFieldId,
    fieldLabel: field.fieldLabel,
    sectionLabel: field.sectionLabel,
    sourceLabel: field.sourceLabel,
    fieldType: field.fieldType,
    status: field.status,
    languagePolicy: field.languagePolicy,
    validation: { ...field.validation },
    profileExcerpt,
  }
}

const buildValidationContext = (fieldId: GksFieldId, validationContext?: ValidationContext) => {
  const field = getFieldById(fieldId)

  return {
    fieldLabel: field?.fieldLabel,
    sectionLabel: field?.sectionLabel,
    sourceLabel: field?.sourceLabel,
    fieldType: field?.fieldType,
    status: field?.status,
    languagePolicy: field?.languagePolicy,
    validation: field ? { ...field.validation } : undefined,
    ...validationContext,
  } satisfies ValidationContext
}

export class MockAIProvider implements AIService {
  async generateNextQuestion(
    fieldId: GksFieldId,
    currentAnswer?: string,
    validationContext?: ValidationContext,
  ) {
    const context = buildValidationContext(fieldId, validationContext)
    const answerSuffix = currentAnswer?.trim()
      ? ` 현재 답변은 "${currentAnswer.trim()}"입니다.`
      : ''

    return `다음 질문입니다. ${context.fieldLabel ?? fieldId} 항목을 위해 구체적으로 설명해 주세요.${answerSuffix}`
  }

  async generateDraft(
    formType: DraftFormType,
    facts: EssayFact[],
    draftMode: DraftMode,
    language: DraftLanguage,
  ) {
    const factSummary = facts.length > 0
      ? facts.map((fact) => `${fact.label}: ${fact.value}`).join(' | ')
      : '선택된 사실 없음'

    if (formType === 'form3') {
      return language === 'english'
        ? `Language Study Plan:\nBuild Korean fluency from the confirmed facts.\n\nGoal and Study Plan:\nDraft from confirmed facts only. ${factSummary}\n\nFuture Plan:\nConnect the study plan to a realistic future contribution.`
        : `어학 계획:\n확인된 사실을 바탕으로 한국어 역량을 키우겠습니다.\n\n학업 목표 및 계획:\n확인된 사실만으로 작성한 초안입니다. ${factSummary}\n\n졸업 후 계획:\n배운 내용을 바탕으로 현실적인 기여 계획을 세우겠습니다.`
    }

    return language === 'english'
      ? `Mock draft (${formType}/${draftMode}): ${factSummary}`
      : `모의 초안(${formType}/${draftMode}): ${factSummary}`
  }
}

export class OpenAIProvider implements AIService {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  ) {}

  async generateNextQuestion(
    fieldId: GksFieldId,
    currentAnswer?: string,
    validationContext?: ValidationContext,
  ) {
    const prompt = {
      task: 'Generate the next Korean interview question for a single application field.',
      fieldId,
      currentAnswer,
      validationContext: buildValidationContext(fieldId, validationContext),
    }

    return this.requestText(prompt)
  }

  async generateDraft(
    formType: DraftFormType,
    facts: EssayFact[],
    draftMode: DraftMode,
    language: DraftLanguage,
  ) {
    const prompt = {
      task:
        'Generate a scholarship essay draft from explicitly selected facts only. Do not invent facts. Do not claim guaranteed admission, guaranteed acceptance, certainty, or 100% success.',
      formType,
      draftMode,
      language,
      facts,
    }

    return this.requestText(prompt)
  }

  private async requestText(input: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: JSON.stringify(input),
      }),
    })

    if (!response.ok) {
      throw new Error(`AI provider request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as {
      output_text?: string
    }

    return payload.output_text ?? ''
  }
}

export const createDefaultAIProvider = (): AIService => {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    return new OpenAIProvider(apiKey)
  }

  return new MockAIProvider()
}

export interface InterviewRequest {
  consent: boolean
  fieldId: GksFieldId
  currentAnswer?: string
  validationContext?: ValidationContext
  profile?: Partial<ApplicantProfile>
}

export interface DraftRequest {
  consent: boolean
  formType: DraftFormType
  facts: EssayFact[]
  draftMode: DraftMode
  language: DraftLanguage
}

export interface InterviewResult {
  question: string
  minimizedPayload: MinimizedFieldContext
}

export interface DraftResult {
  draft: string
  facts: EssayFact[]
}

export class ConsentGatedAIAdapter {
  constructor(
    private readonly provider: AIService = createDefaultAIProvider(),
    private readonly consentManagerFactory: (hasConsent: boolean) => ConsentManager =
      (hasConsent) => new ConsentManager(hasConsent),
  ) {}

  async generateInterviewQuestion(request: InterviewRequest): Promise<InterviewResult> {
    this.consentManagerFactory(request.consent).assertAllowed()

    const minimizedPayload = minimizePayload(request.profile ?? {}, request.fieldId)
    const question = await this.provider.generateNextQuestion(
      request.fieldId,
      request.currentAnswer,
      {
        ...minimizedPayload,
        ...request.validationContext,
      },
    )

    return {
      question,
      minimizedPayload,
    }
  }

  async generateEssayDraft(request: DraftRequest): Promise<DraftResult> {
    this.consentManagerFactory(request.consent).assertAllowed()

    const sanitizedFacts = request.facts.map((fact) => ({
      id: fact.id,
      label: fact.label,
      value: fact.value,
    }))

    const draft = await this.provider.generateDraft(
      request.formType,
      sanitizedFacts,
      request.draftMode,
      request.language,
    )

    return {
      draft,
      facts: sanitizedFacts,
    }
  }
}
