import {
  ConsentGatedAIAdapter,
  minimizePayload,
  type DraftLanguage,
  type EssayFact,
  type MinimizedFieldContext,
} from './ai-adapter'
import { updateProfileField } from './interview-engine'
import { getFieldById, type ApplicantProfile, type GksFieldId } from './gks-schema'
import { ProfileStore } from './profile-store'
import { validateField, validateLanguagePolicy } from './validation'

export type EssayDraftFieldId =
  | 'form2.section1.personalStatement'
  | 'form3.section2.goalStudyPlan'

export interface EssayDraftResult {
  draftText: string
  language: DraftLanguage
}

export interface DraftSafetyResult {
  safe: boolean
  flags: string[]
}

export interface DraftRequestBody {
  consent: boolean
  fieldId: EssayDraftFieldId
  profile?: Partial<ApplicantProfile>
  userBullets: string
  language: DraftLanguage
}

const SUPPORTED_FIELD_IDS: EssayDraftFieldId[] = [
  'form2.section1.personalStatement',
  'form3.section2.goalStudyPlan',
]

const GUARANTEE_PATTERNS: Array<{ pattern: RegExp; flag: string }> = [
  { pattern: /guaranteed\s+admission/i, flag: 'admission guarantee claim' },
  { pattern: /guarantee(?:s|d)?\s+acceptance/i, flag: 'acceptance guarantee claim' },
  { pattern: /guarantee(?:s|d)?\s+admission/i, flag: 'admission guarantee claim' },
  { pattern: /100\s*%\s+success\s+rate/i, flag: 'absolute success rate claim' },
  { pattern: /100\s*percent\s+success\s+rate/i, flag: 'absolute success rate claim' },
]

const cleanBulletLine = (line: string) => line.replace(/^[\s\-•*\d.)]+/, '').trim()

const parseBullets = (userBullets: string) =>
  userBullets
    .split(/\r?\n/)
    .map(cleanBulletLine)
    .filter(Boolean)

const flattenObjectFacts = (
  value: unknown,
  prefix: string,
  labelPrefix = 'confirmed',
): EssayFact[] => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? [{ id: `${labelPrefix}.${prefix}`, label: prefix, value: trimmed }] : []
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '')).trim())
      .filter(Boolean)

    return normalized.length > 0
      ? [{ id: `${labelPrefix}.${prefix}`, label: prefix, value: normalized.join(', ') }]
      : []
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nestedValue]) =>
      flattenObjectFacts(nestedValue, `${prefix}.${key}`, labelPrefix),
    )
  }

  if (typeof value === 'boolean') {
    return [{ id: `${labelPrefix}.${prefix}`, label: prefix, value: value ? 'yes' : 'no' }]
  }

  return []
}

const getRelevantProfileFacts = (profile: Partial<ApplicantProfile>): EssayFact[] => {
  const facts: EssayFact[] = []

  if (profile.applicationTrack) {
    facts.push({
      id: 'profile.applicationTrack',
      label: 'applicationTrack',
      value: profile.applicationTrack,
    })
  }

  if (profile.applicationType) {
    facts.push({
      id: 'profile.applicationType',
      label: 'applicationType',
      value: profile.applicationType,
    })
  }

  if (profile.degree) {
    facts.push({ id: 'profile.degree', label: 'degree', value: profile.degree })
  }

  if (profile.fieldOfStudy?.length) {
    facts.push({
      id: 'profile.fieldOfStudy',
      label: 'fieldOfStudy',
      value: profile.fieldOfStudy.join(', '),
    })
  }

  if (profile.topikLevel) {
    facts.push({ id: 'profile.topikLevel', label: 'topikLevel', value: profile.topikLevel })
  }

  const universityChoice = profile.universityChoices?.universityChoice
  if (universityChoice?.university) {
    facts.push({
      id: 'profile.universityChoice.university',
      label: 'targetUniversity',
      value: universityChoice.university,
    })
  }

  if (universityChoice?.department) {
    facts.push({
      id: 'profile.universityChoice.department',
      label: 'targetDepartment',
      value: universityChoice.department,
    })
  }

  return facts
}

const buildDraftFacts = (
  fieldId: EssayDraftFieldId,
  profile: Partial<ApplicantProfile>,
  userBullets: string,
  language: DraftLanguage,
): { facts: EssayFact[]; minimizedPayload: MinimizedFieldContext } => {
  const minimizedPayload = minimizePayload(profile, fieldId)
  const bulletFacts = parseBullets(userBullets).map((bullet, index) => ({
    id: `user-bullet-${index + 1}`,
    label: `userBullet${index + 1}`,
    value: bullet,
  }))

  const minimizedFacts = flattenObjectFacts(minimizedPayload.profileExcerpt, minimizedPayload.fieldLabel)

  const facts: EssayFact[] = [
    { id: 'instruction.language', label: 'draftLanguage', value: language },
    {
      id: 'instruction.scope',
      label: 'writingScope',
      value:
        fieldId === 'form2.section1.personalStatement'
          ? 'Write a personal statement draft only from the confirmed facts and user bullets.'
          : 'Write a three-part study plan draft covering language study plan, goal and study plan, and future plan using only the confirmed facts and user bullets.',
    },
    {
      id: 'instruction.safety',
      label: 'safetyRule',
      value:
        'Do not invent facts and do not claim guaranteed admission, guaranteed acceptance, certainty, or 100% success.',
    },
    ...getRelevantProfileFacts(profile),
    ...minimizedFacts,
    ...bulletFacts,
  ]

  return {
    facts,
    minimizedPayload,
  }
}

const isSupportedFieldId = (fieldId: GksFieldId): fieldId is EssayDraftFieldId => {
  if (!SUPPORTED_FIELD_IDS.includes(fieldId as EssayDraftFieldId)) {
    return false
  }

  return true
}

const getFormType = (fieldId: EssayDraftFieldId) =>
  fieldId === 'form2.section1.personalStatement' ? 'form2' : 'form3'

export const buildDraftFailurePrompt = (
  fieldId: EssayDraftFieldId,
  userBullets: string,
  language: DraftLanguage,
) => {
  const heading =
    language === 'english'
      ? 'AI draft generation failed. Please retry or use the bullets below as a manual drafting prompt.'
      : 'AI 초안 생성에 실패했습니다. 다시 시도하거나 아래 bullet을 수동 초안 프롬프트로 사용해 주세요.'

  const scope =
    fieldId === 'form2.section1.personalStatement'
      ? language === 'english'
        ? 'Write a FORM 2 Personal Statement draft using only these bullets.'
        : '아래 bullet만 사용해서 FORM 2 Personal Statement 초안을 작성하세요.'
      : language === 'english'
        ? 'Write a FORM 3 Study Plan draft with three sections: Language Study Plan, Goal and Study Plan, Future Plan. Use only these bullets.'
        : '아래 bullet만 사용해서 FORM 3 Study Plan 초안을 작성하세요. 세 섹션은 Language Study Plan, Goal and Study Plan, Future Plan 순서로 구성하세요.'

  return `${heading}\n\n${scope}\n\n${userBullets.trim()}`.trim()
}

export const generateDraft = async (
  fieldId: EssayDraftFieldId,
  profile: Partial<ApplicantProfile>,
  userBullets: string,
  language: DraftLanguage,
  consentGiven: boolean,
  adapter: ConsentGatedAIAdapter = new ConsentGatedAIAdapter(),
): Promise<EssayDraftResult> => {
  if (!isSupportedFieldId(fieldId)) {
    throw new Error(`Unsupported draft field ID: ${fieldId}`)
  }

  const field = getFieldById(fieldId)

  if (!field) {
    throw new Error(`Unknown field ID: ${fieldId}`)
  }

  const inputLanguageErrors = validateLanguagePolicy(userBullets, field.languagePolicy)
  if (inputLanguageErrors.length > 0) {
    throw new Error(`Draft input failed language policy: ${inputLanguageErrors.join(', ')}`)
  }

  const { facts } = buildDraftFacts(fieldId, profile, userBullets, language)
  const result = await adapter.generateEssayDraft({
    consent: consentGiven,
    formType: getFormType(fieldId),
    draftMode: 'polished',
    facts,
    language,
  })

  const outputValidation = validateField(fieldId, result.draft, field)
  if (outputValidation.status === 'invalid') {
    throw new Error(`Draft output failed validation: ${outputValidation.errors.join(', ')}`)
  }

  return {
    draftText: result.draft,
    language,
  }
}

export const checkDraftSafety = (text: string): DraftSafetyResult => {
  const flags = GUARANTEE_PATTERNS.flatMap(({ pattern, flag }) =>
    pattern.test(text) ? [flag] : [],
  )

  return {
    safe: flags.length === 0,
    flags,
  }
}

export const splitForm3DraftSections = (draftText: string) => {
  const patterns = [
    /Language Study Plan:\s*([\s\S]*?)\n\s*Goal and Study Plan:\s*([\s\S]*?)\n\s*Future Plan:\s*([\s\S]*)/i,
    /어학(?:\s*연수)?\s*계획:\s*([\s\S]*?)\n\s*(?:학업\s*목표\s*및\s*계획|학업목표\s*및\s*계획):\s*([\s\S]*?)\n\s*(?:졸업\s*후\s*계획|향후\s*계획):\s*([\s\S]*)/i,
  ]

  for (const pattern of patterns) {
    const match = draftText.match(pattern)

    if (match) {
      return {
        languageStudyPlan: match[1].trim(),
        goalStudyPlan: match[2].trim(),
        futurePlan: match[3].trim(),
      }
    }
  }

  return {
    languageStudyPlan: draftText.trim(),
    goalStudyPlan: draftText.trim(),
    futurePlan: draftText.trim(),
  }
}

export const persistAcceptedDraft = (
  fieldId: EssayDraftFieldId,
  draftText: string,
  profileStore: ProfileStore,
) => {
  const currentProfile = profileStore.load()

  if (fieldId === 'form2.section1.personalStatement') {
    const updatedProfile = updateProfileField(currentProfile, fieldId, draftText)
    profileStore.save(updatedProfile as ApplicantProfile)
    return updatedProfile
  }

  const sections = splitForm3DraftSections(draftText)
  let updatedProfile = updateProfileField(
    currentProfile,
    'form3.section1.languageStudyPlan',
    sections.languageStudyPlan,
  )
  updatedProfile = updateProfileField(
    updatedProfile,
    'form3.section2.goalStudyPlan',
    sections.goalStudyPlan,
  )
  updatedProfile = updateProfileField(
    updatedProfile,
    'form3.section3.futurePlan',
    sections.futurePlan,
  )
  profileStore.save(updatedProfile as ApplicantProfile)

  return updatedProfile
}

export const __internal__ = {
  buildDraftFacts,
}
