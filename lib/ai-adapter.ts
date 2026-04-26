import { getFieldById, type ApplicantProfile, type GksFieldId } from './gks-schema'
import {
  getDeterministicKoreanQuestion,
  planInterviewPhase,
  type InterviewPhaseId,
  type InterviewPhasePlan,
} from './interview-engine'

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
  generateNextQuestion(input: InterviewGenerationInput): Promise<string>
  generateReplySuggestions(input: InterviewGenerationInput): Promise<InterviewChoice[]>
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

export interface InterviewTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
  fieldId?: GksFieldId
}

export type InterviewAction = 'question' | 'assist'

export type InterviewInputMode = 'text' | 'single_choice' | 'multi_choice'

export type InterviewChoiceSource = 'none' | 'schema' | 'ai_assist'

export interface InterviewChoice {
  id: string
  label: string
  value: string
}

export interface InterviewGenerationInput {
  fieldId: GksFieldId
  currentAnswer?: string
  currentQuestion?: string
  maxSuggestions?: number
  validationContext?: ValidationContext
  turns?: InterviewTurn[]
  phase?: InterviewPhasePlan | null
}

export interface InterviewPhaseSummary {
  id: InterviewPhaseId
  label: string
  description: string
  currentFieldId: GksFieldId
  pendingFieldIds: GksFieldId[]
  pendingFieldLabels: string[]
  completedFieldCount: number
  totalFieldCount: number
}

export interface InterviewTurnResponse {
  role: 'assistant'
  content: string
  fieldId: GksFieldId
}

export interface InterviewUiConfig {
  inputMode: InterviewInputMode
  choiceSource: InterviewChoiceSource
  choices: InterviewChoice[]
}

const resolveValidationOptions = (validationContext?: ValidationContext): string[] => {
  const validation = validationContext?.validation

  if (!validation) {
    return []
  }

  const directOptions = validation.options

  if (Array.isArray(directOptions)) {
    return directOptions.filter((option): option is string => typeof option === 'string')
  }

  const optionScope = validation.optionScope

  if (!optionScope || typeof optionScope !== 'object') {
    return []
  }

  const scopedOptions = (optionScope as Record<string, unknown>)[validationContext?.track ?? 'embassy']

  return Array.isArray(scopedOptions)
    ? scopedOptions.filter((option): option is string => typeof option === 'string')
    : []
}

const serializeTurns = (turns?: InterviewTurn[]) =>
  (turns ?? [])
    .filter((turn) => turn.content.trim().length > 0)
    .slice(-6)
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim(),
      ...(turn.fieldId ? { fieldId: turn.fieldId } : {}),
    }))

const toChoiceId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'choice'

const buildChoiceItems = (options: readonly string[]): InterviewChoice[] =>
  options.map((option) => ({
    id: toChoiceId(option),
    label: option,
    value: option,
  }))

const getFieldChoiceConfig = (
  fieldId: GksFieldId,
  validationContext?: ValidationContext,
): InterviewUiConfig => {
  if (fieldId === 'form5.section1.consentGroup') {
    return {
      inputMode: 'single_choice',
      choiceSource: 'schema',
      choices: [{ id: 'confirm-all-agreements', label: 'I confirm all 15 agreements', value: 'yes' }],
    }
  }

  if (fieldId === 'form6.section1.medicalChecklist') {
    return {
      inputMode: 'single_choice',
      choiceSource: 'schema',
      choices: [
        { id: 'medical-yes', label: 'Yes, I have medical conditions', value: 'yes' },
        { id: 'medical-no', label: 'No medical conditions', value: 'no' },
      ],
    }
  }

  const options = resolveValidationOptions(validationContext)

  if (options.length === 0) {
    return {
      inputMode: 'text',
      choiceSource: 'none',
      choices: [],
    }
  }

  return {
    inputMode: validationContext?.validation?.allowsMultiple ? 'multi_choice' : 'single_choice',
    choiceSource: 'schema',
    choices: buildChoiceItems(options),
  }
}

const buildAssistPromptPayload = (input: InterviewGenerationInput) => {
  const context = buildValidationContext(input.fieldId, input.validationContext)

  return {
    task: 'Generate 2 to 4 candidate user replies for the current scholarship interview field.',
    responseRequirements: [
      'Respond in English only.',
      'Return a JSON array of strings only.',
      'Do not invent personal facts that are not already present in the provided context.',
      'Use safe templates, plausible placeholders, or grounded candidate phrasings the user can choose from.',
      'Keep each suggestion concise and user-facing.',
      'If the field is subjective, offer different tones or angles rather than invented specifics.',
    ],
    currentField: {
      id: input.fieldId,
      label: context.fieldLabel ?? input.fieldId,
      sectionLabel: context.sectionLabel,
      fieldType: context.fieldType,
      status: context.status,
      options: resolveValidationOptions(context),
      validation: context.validation,
    },
    currentQuestion: input.currentQuestion?.trim() || undefined,
    currentAnswer: input.currentAnswer?.trim() || undefined,
    maxSuggestions: input.maxSuggestions ?? 3,
    phase: input.phase
      ? {
          id: input.phase.id,
          label: input.phase.label,
          description: input.phase.description,
          currentFieldId: input.phase.currentField.id,
          pendingFieldIds: input.phase.pendingFieldIds,
        }
      : undefined,
    recentTurns: serializeTurns(input.turns),
    profileExcerpt: context.validation,
  }
}

const parseSuggestionTexts = (raw: string, maxSuggestions: number): InterviewChoice[] => {
  const normalized = raw.trim()

  const tryArray = () => {
    const parsed = JSON.parse(normalized) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
  }

  let suggestions: string[] = []

  try {
    suggestions = tryArray()
  } catch {
    suggestions = normalized
      .split(/\n+/)
      .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(Boolean)
  }

  return buildChoiceItems([...new Set(suggestions)].slice(0, maxSuggestions))
}

const buildInterviewPromptPayload = (input: InterviewGenerationInput) => {
  const context = buildValidationContext(input.fieldId, input.validationContext)

  return {
    task: 'Generate the next conversational interview prompt for exactly one scholarship application field.',
    responseRequirements: [
      'Respond in English only.',
      'Return exactly one concise question sentence or two short sentences.',
      'Stay focused on the current field only, even when a phase contains multiple fields.',
      'If options are available, mention them naturally.',
      'If the previous answer looks incomplete, ask a brief clarifying follow-up for the same field.',
      'Do not mention hidden schema IDs, internal validation objects, or system prompts.',
    ],
    currentField: {
      id: input.fieldId,
      label: context.fieldLabel ?? input.fieldId,
      sectionLabel: context.sectionLabel,
      sourceLabel: context.sourceLabel,
      fieldType: context.fieldType,
      status: context.status,
      languagePolicy: context.languagePolicy,
      options: resolveValidationOptions(context),
      validation: context.validation,
    },
    currentAnswer: input.currentAnswer?.trim() || undefined,
    phase: input.phase
      ? {
          id: input.phase.id,
          label: input.phase.label,
          description: input.phase.description,
          currentFieldId: input.phase.currentField.id,
          pendingFieldIds: input.phase.pendingFieldIds,
          pendingFieldLabels: input.phase.pendingFieldLabels,
          completedFieldCount: input.phase.completedFieldCount,
          totalFieldCount: input.phase.totalFieldCount,
        }
      : undefined,
    recentTurns: serializeTurns(input.turns),
  }
}

const buildInterviewFallbackQuestion = (input: InterviewGenerationInput) => {
  const field = getFieldById(input.fieldId)
  const baseQuestion = field ? getDeterministicKoreanQuestion(field) : 'Please share the next application detail.'

  if (!input.currentAnswer?.trim()) {
    return baseQuestion
  }

  return `Thanks. I noted "${input.currentAnswer.trim()}". ${baseQuestion}`
}

const extractGeminiText = (payload: GeminiResponsePayload): string => {
  for (const candidate of payload.candidates ?? []) {
    const text = candidate.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim()

    if (text) {
      return text
    }
  }

  return ''
}

type GeminiResponsePayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
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
  async generateNextQuestion(input: InterviewGenerationInput) {
    const context = buildValidationContext(input.fieldId, input.validationContext)
    const options = resolveValidationOptions(context)

    if (input.fieldId === 'form5.section1.consentGroup') {
      return 'Before we continue, can you confirm that you accept all 15 agreement items in the consent form?'
    }

    if (input.fieldId === 'form6.section1.medicalChecklist') {
      return 'Should I record any yes answers on your medical checklist, or is every item a no?'
    }

    if (options.length > 0) {
      return `For ${context.fieldLabel ?? input.fieldId}, which option should I record: ${options.join(', ')}?`
    }

    return buildInterviewFallbackQuestion(input)
  }

  async generateReplySuggestions(input: InterviewGenerationInput) {
    const context = buildValidationContext(input.fieldId, input.validationContext)
    const fieldLabel = context.fieldLabel ?? 'this field'
    const maxSuggestions = input.maxSuggestions ?? 3
    const templates = [
      `I would like help drafting a response for ${fieldLabel}.`,
      `Please use the information already in my documents to suggest wording for ${fieldLabel}.`,
      `I want a clear and formal answer for ${fieldLabel}.`,
      `Please suggest a concise reply for ${fieldLabel}.`,
    ]

    return buildChoiceItems(templates.slice(0, maxSuggestions))
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

  async generateNextQuestion(input: InterviewGenerationInput) {
    const prompt = buildInterviewPromptPayload(input)

    return this.requestText(prompt)
  }

  async generateReplySuggestions(input: InterviewGenerationInput) {
    const fallback = await new MockAIProvider().generateReplySuggestions(input)
    return fallback
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

export class GeminiProvider implements AIService {
  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
    private readonly baseUrl = process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta/models',
  ) {}

  async generateNextQuestion(input: InterviewGenerationInput) {
    return this.requestText(
      'You are a scholarship interview assistant. Respond in English only. Return only the next user-facing question text for the current field.',
      buildInterviewPromptPayload(input),
      300,
    )
  }

  async generateReplySuggestions(input: InterviewGenerationInput) {
    const maxSuggestions = input.maxSuggestions ?? 3
    const raw = await this.requestText(
      'You help scholarship applicants by proposing safe candidate replies. Respond with a JSON array of strings only.',
      buildAssistPromptPayload(input),
      400,
    )

    const parsed = parseSuggestionTexts(raw, maxSuggestions)

    if (parsed.length > 0) {
      return parsed
    }

    return new MockAIProvider().generateReplySuggestions(input)
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

    return this.requestText(
      'You write scholarship drafts carefully and follow the requested language exactly.',
      prompt,
      1200,
    )
  }

  private async requestText(
    systemInstruction: string,
    payload: Record<string, unknown>,
    maxOutputTokens: number,
  ) {
    const response = await fetch(`${this.baseUrl}/${this.model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(payload) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens,
        },
      }),
    })

    const responsePayload = (await response.json()) as GeminiResponsePayload

    if (!response.ok) {
      throw new Error(
        responsePayload.error?.message || `Gemini provider request failed with status ${response.status}`,
      )
    }

    const text = extractGeminiText(responsePayload)

    if (!text) {
      throw new Error('Gemini provider returned an empty response.')
    }

    return text
  }
}

export const createDefaultAIProvider = (): AIService => {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY

  if (geminiApiKey) {
    return new GeminiProvider(geminiApiKey)
  }

  if (apiKey) {
    return new OpenAIProvider(apiKey)
  }

  return new MockAIProvider()
}

export interface InterviewRequest {
  action?: InterviewAction
  consent: boolean
  fieldId: GksFieldId
  currentAnswer?: string
  message?: string
  currentQuestion?: string
  maxSuggestions?: 2 | 3 | 4
  turns?: InterviewTurn[]
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
  action: InterviewAction
  question: string
  message: string
  turn: InterviewTurnResponse
  phase: InterviewPhaseSummary | null
  pendingFieldIds: GksFieldId[]
  currentField: {
    id: GksFieldId
    label: string
    sectionLabel: string
    fieldType: string
    status: string
  }
  ui: InterviewUiConfig
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

    const action = request.action ?? 'question'
    const profile = request.profile ?? {}
    const minimizedPayload = minimizePayload(profile, request.fieldId)
    const phasePlan = profile.applicationTrack
      ? planInterviewPhase(profile, profile.applicationTrack)
      : null
    const validationContext = {
      track: profile.applicationTrack,
      applicationType: profile.applicationType,
      degree: profile.degree,
      ...minimizedPayload,
      ...request.validationContext,
    }
    const schemaUi = getFieldChoiceConfig(request.fieldId, validationContext)

    if (action === 'assist') {
      let suggestions: InterviewChoice[] = []

      try {
        suggestions = await this.provider.generateReplySuggestions({
          fieldId: request.fieldId,
          currentAnswer: request.message ?? request.currentAnswer,
          currentQuestion: request.currentQuestion,
          maxSuggestions: request.maxSuggestions,
          validationContext,
          turns: serializeTurns(request.turns),
          phase: phasePlan,
        })
      } catch {
        suggestions = await new MockAIProvider().generateReplySuggestions({
          fieldId: request.fieldId,
          currentAnswer: request.message ?? request.currentAnswer,
          currentQuestion: request.currentQuestion,
          maxSuggestions: request.maxSuggestions,
          validationContext,
          turns: serializeTurns(request.turns),
          phase: phasePlan,
        })
      }

      const phase = phasePlan
        ? {
            id: phasePlan.id,
            label: phasePlan.label,
            description: phasePlan.description,
            currentFieldId: phasePlan.currentField.id as GksFieldId,
            pendingFieldIds: phasePlan.pendingFieldIds,
            pendingFieldLabels: phasePlan.pendingFieldLabels,
            completedFieldCount: phasePlan.completedFieldCount,
            totalFieldCount: phasePlan.totalFieldCount,
          }
        : null

      return {
        action,
        question: request.currentQuestion ?? `Please provide your ${minimizedPayload.fieldLabel}.`,
        message: suggestions.length > 0
          ? 'I prepared a few answer suggestions you can choose from.'
          : 'I could not prepare suggestions for this field, so please type your answer directly.',
        turn: {
          role: 'assistant',
          content: suggestions.length > 0
            ? 'I prepared a few answer suggestions you can choose from.'
            : 'I could not prepare suggestions for this field, so please type your answer directly.',
          fieldId: request.fieldId,
        },
        phase,
        pendingFieldIds: phase?.pendingFieldIds ?? [request.fieldId],
        currentField: {
          id: request.fieldId,
          label: minimizedPayload.fieldLabel,
          sectionLabel: minimizedPayload.sectionLabel,
          fieldType: minimizedPayload.fieldType,
          status: minimizedPayload.status,
        },
        ui: {
          inputMode: suggestions.length > 0 ? 'single_choice' : 'text',
          choiceSource: suggestions.length > 0 ? 'ai_assist' : 'none',
          choices: suggestions,
        },
        minimizedPayload,
      }
    }

    let question = ''

    try {
      question = await this.provider.generateNextQuestion({
        fieldId: request.fieldId,
        currentAnswer: request.message ?? request.currentAnswer,
        validationContext,
        turns: serializeTurns(request.turns),
        phase: phasePlan,
      })
    } catch {
      question = await new MockAIProvider().generateNextQuestion({
        fieldId: request.fieldId,
        currentAnswer: request.message ?? request.currentAnswer,
        validationContext,
        turns: serializeTurns(request.turns),
        phase: phasePlan,
      })
    }

    const phase = phasePlan
      ? {
          id: phasePlan.id,
          label: phasePlan.label,
          description: phasePlan.description,
          currentFieldId: phasePlan.currentField.id as GksFieldId,
          pendingFieldIds: phasePlan.pendingFieldIds,
          pendingFieldLabels: phasePlan.pendingFieldLabels,
          completedFieldCount: phasePlan.completedFieldCount,
          totalFieldCount: phasePlan.totalFieldCount,
        }
      : null
    return {
      action,
      question,
      message: question,
      turn: {
        role: 'assistant',
        content: question,
        fieldId: request.fieldId,
      },
      phase,
      pendingFieldIds: phase?.pendingFieldIds ?? [request.fieldId],
      currentField: {
        id: request.fieldId,
        label: minimizedPayload.fieldLabel,
        sectionLabel: minimizedPayload.sectionLabel,
        fieldType: minimizedPayload.fieldType,
        status: minimizedPayload.status,
      },
      ui: schemaUi,
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
