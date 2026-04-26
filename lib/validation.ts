import {
  MILESTONE_1_FIELD_IDS,
  getFieldById,
  getMilestoneFields,
  type ApplicantProfile,
  type ApplicationTrack,
  type GksField,
  type GksFieldId,
  type LanguagePolicy,
} from './gks-schema'

export type ValidationStatus = 'missing' | 'invalid' | 'valid'

export type ValidationErrorCode =
  | 'REQUIRED'
  | 'ENGLISH_ONLY'
  | 'INVALID_DATE'
  | 'INVALID_EMAIL'

export interface FieldValidationResult {
  status: ValidationStatus
  errors: ValidationErrorCode[]
}

export interface CompletionReport {
  missing: GksFieldId[]
  invalid: Array<{
    fieldId: GksFieldId
    errors: ValidationErrorCode[]
  }>
  skipped: GksFieldId[]
  readyForDocxProof: boolean
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'boolean') {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (isPlainObject(value)) {
    return Object.values(value).some((entry) => hasMeaningfulValue(entry))
  }

  return true
}

const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStrings(entry))
  }

  if (isPlainObject(value)) {
    return Object.values(value).flatMap((entry) => collectStrings(entry))
  }

  return []
}

const dedupeErrors = (errors: ValidationErrorCode[]) => [...new Set(errors)]

export const getProfileFieldValue = (
  profile: Partial<ApplicantProfile>,
  fieldId: GksFieldId,
): unknown => {
  switch (fieldId) {
    case 'form1.section1.applicationTrack':
      return profile.applicationTrack
    case 'form1.section2.applicationType':
      return profile.applicationType
    case 'form1.section3.degree':
      return profile.degree
    case 'form1.section4.fieldOfStudy':
      return profile.fieldOfStudy
    case 'form1.section5.familyName':
      return profile.fullNameEnglish?.familyName
    case 'form1.section5.givenName':
      return profile.fullNameEnglish?.givenName
    case 'form1.section5.middleName':
      return profile.fullNameEnglish?.middleName
    case 'form1.section5.dateOfBirth':
      return profile.dateOfBirth
    case 'form1.section5.gender':
      return profile.gender
    case 'form1.section5.citizenship':
      return profile.citizenship
    case 'form1.section5.koreanCitizenshipApplicant':
      return profile.koreanCitizenshipApplicant
    case 'form1.section5.koreanCitizenshipParents':
      return profile.koreanCitizenshipParents
    case 'form1.section5.address':
      return profile.address
    case 'form1.section5.phone':
      return profile.phone
    case 'form1.section5.email':
      return profile.email
    case 'form1.section6.topikLevel':
      return profile.topikLevel
    case 'form1.section7.highSchoolName':
      return profile.education?.highSchoolName
    case 'form1.section7.highSchoolLocation':
      return profile.education?.highSchoolLocation
    case 'form1.section7.highSchoolPeriod':
      return profile.education?.highSchoolPeriod
    case 'form1.section7.highSchoolGraduationDate':
      return profile.education?.highSchoolGraduationDate
    case 'form1.section7.associateInstitutionName':
      return profile.education?.associateInstitutionName
    case 'form1.section7.associateInstitutionLocation':
      return profile.education?.associateInstitutionLocation
    case 'form1.section7.associateInstitutionPeriod':
      return profile.education?.associateInstitutionPeriod
    case 'form1.section7.associateInstitutionGraduationDate':
      return profile.education?.associateInstitutionGraduationDate
    case 'form1.section9.embassyChoice1.university':
      return profile.universityChoices?.embassyChoices?.[0]?.university
    case 'form1.section9.embassyChoice1.fieldOfStudy':
      return profile.universityChoices?.embassyChoices?.[0]?.fieldOfStudy
    case 'form1.section9.embassyChoice1.department':
      return profile.universityChoices?.embassyChoices?.[0]?.department
    case 'form1.section9.embassyChoice1.other':
      return profile.universityChoices?.embassyChoices?.[0]?.other
    case 'form1.section9.embassyChoice2.university':
      return profile.universityChoices?.embassyChoices?.[1]?.university
    case 'form1.section9.embassyChoice2.fieldOfStudy':
      return profile.universityChoices?.embassyChoices?.[1]?.fieldOfStudy
    case 'form1.section9.embassyChoice2.department':
      return profile.universityChoices?.embassyChoices?.[1]?.department
    case 'form1.section9.embassyChoice2.other':
      return profile.universityChoices?.embassyChoices?.[1]?.other
    case 'form1.section9.embassyChoice3.university':
      return profile.universityChoices?.embassyChoices?.[2]?.university
    case 'form1.section9.embassyChoice3.fieldOfStudy':
      return profile.universityChoices?.embassyChoices?.[2]?.fieldOfStudy
    case 'form1.section9.embassyChoice3.department':
      return profile.universityChoices?.embassyChoices?.[2]?.department
    case 'form1.section9.embassyChoice3.other':
      return profile.universityChoices?.embassyChoices?.[2]?.other
    case 'form1.section9.universityChoice.university':
      return profile.universityChoices?.universityChoice?.university
    case 'form1.section9.universityChoice.fieldOfStudy':
      return profile.universityChoices?.universityChoice?.fieldOfStudy
    case 'form1.section9.universityChoice.department':
      return profile.universityChoices?.universityChoice?.department
    case 'form1.section9.universityChoice.other':
      return profile.universityChoices?.universityChoice?.other
    case 'form2.section1.personalStatement':
      return profile.form2PersonalStatement
    case 'form3.section1.languageStudyPlan':
      return profile.form3StudyPlan?.languageStudyPlan
    case 'form3.section2.goalStudyPlan':
      return profile.form3StudyPlan?.goalStudyPlan
    case 'form3.section3.futurePlan':
      return profile.form3StudyPlan?.futurePlan
    case 'form5.section1.consentGroup':
      return profile.form5ConsentGroup?.agreementsAccepted
    case 'form6.section1.medicalChecklist':
      return profile.form6MedicalSample?.answers ?? profile.form6MedicalSample?.anyYes
    default:
      return undefined
  }
}

export const validateEnglishOnly = (value: unknown): ValidationErrorCode[] => {
  const strings = collectStrings(value)

  if (strings.length === 0) {
    return []
  }

  return strings.every((entry) => [...entry].every((character) => character.charCodeAt(0) <= 0x7f))
    ? []
    : ['ENGLISH_ONLY']
}

export const validateDateFormat = (value: unknown): ValidationErrorCode[] => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return []
  }

  if (!ISO_DATE_PATTERN.test(value)) {
    return ['INVALID_DATE']
  }

  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(Date.UTC(year, month - 1, day))

  return candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
    ? []
    : ['INVALID_DATE']
}

export const validateEmailFormat = (value: unknown): ValidationErrorCode[] => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return []
  }

  return EMAIL_PATTERN.test(value) ? [] : ['INVALID_EMAIL']
}

export const validateRequired = (value: unknown): ValidationErrorCode[] =>
  hasMeaningfulValue(value) ? [] : ['REQUIRED']

export const validateLanguagePolicy = (
  value: unknown,
  policy: LanguagePolicy,
): ValidationErrorCode[] => {
  if (policy !== 'english-only') {
    return []
  }

  return validateEnglishOnly(value)
}

export const getPhoneCountryCodeHint = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed || trimmed.startsWith('+')) {
    return null
  }

  return '전화번호는 국가번호를 포함한 형식(+82 ...)으로 적어두면 DOCX proof 정리에 더 안전합니다.'
}

export const validateField = (
  _fieldId: GksFieldId,
  value: unknown,
  field: GksField,
): FieldValidationResult => {
  const requiredErrors = field.status === 'required' ? validateRequired(value) : []

  if (requiredErrors.length > 0) {
    return {
      status: 'missing',
      errors: requiredErrors,
    }
  }

  if (!hasMeaningfulValue(value)) {
    return {
      status: 'valid',
      errors: [],
    }
  }

  const errors = dedupeErrors([
    ...validateLanguagePolicy(value, field.languagePolicy),
    ...(field.validation.pattern === 'iso-date' ? validateDateFormat(value) : []),
    ...(field.validation.pattern === 'email' ? validateEmailFormat(value) : []),
  ])

  return {
    status: errors.length > 0 ? 'invalid' : 'valid',
    errors,
  }
}

export const generateCompletionReport = (
  profile: Partial<ApplicantProfile>,
  track: ApplicationTrack,
): CompletionReport => {
  const activeFieldIds = new Set(getMilestoneFields(track, profile).map((field) => field.id as GksFieldId))

  const missing: GksFieldId[] = []
  const invalid: CompletionReport['invalid'] = []
  const skipped: GksFieldId[] = []
  let readyForDocxProof = true

  for (const fieldId of MILESTONE_1_FIELD_IDS) {
    const field = getFieldById(fieldId)

    if (!field) {
      continue
    }

    if (!activeFieldIds.has(fieldId)) {
      skipped.push(fieldId)
      continue
    }

    const result = validateField(fieldId, getProfileFieldValue(profile, fieldId), field)

    if (result.status === 'missing') {
      missing.push(fieldId)

      if (field.status === 'required') {
        readyForDocxProof = false
      }

      continue
    }

    if (result.status === 'invalid') {
      invalid.push({ fieldId, errors: result.errors })

      if (field.status === 'required') {
        readyForDocxProof = false
      }
    }
  }

  return {
    missing,
    invalid,
    skipped,
    readyForDocxProof,
  }
}
