export type ApplicationTrack = 'embassy' | 'university'

export type FieldType = 'text' | 'date' | 'checkbox' | 'multiline' | 'select'

export type LanguagePolicy = 'english-only' | 'korean-or-english' | 'none'

export type TrackCondition = 'embassy' | 'university' | 'both'

export type FieldStatus = 'required' | 'optional'

export type FormNumber = 'checklist' | 1 | 2 | 3 | 4 | 5 | 6

export type ApplicationType =
  | 'general'
  | 'overseas-koreans'
  | 'r-gks'
  | 'uic'
  | 'associate-degree'

export type DegreeType = 'bachelor' | 'associate'

export interface MedicalSampleAnswerMap {
  tuberculosis?: boolean
  drugAllergy?: boolean
  chronicDisorder?: boolean
  mentalHealthTreatment?: boolean
  regularMedication?: boolean
  infectiousDisease?: boolean
  substanceUseTreatment?: boolean
  visualImpairment?: boolean
  hearingImpairment?: boolean
  mobilityImpairment?: boolean
  digestiveDisorder?: boolean
  respiratoryDisorder?: boolean
  cardiovascularDisorder?: boolean
  endocrineDisorder?: boolean
  otherMedicalCondition?: boolean
}

export interface ApplicantProfile {
  applicationTrack?: ApplicationTrack
  applicationType?: ApplicationType
  degree?: DegreeType
  fieldOfStudy?: string[]
  fullNameEnglish?: {
    familyName?: string
    givenName?: string
    middleName?: string
  }
  dateOfBirth?: string
  gender?: 'M' | 'F'
  citizenship?: string
  koreanCitizenshipApplicant?: boolean
  koreanCitizenshipParents?: boolean
  address?: string
  phone?: string
  email?: string
  topikLevel?: '1' | '2' | '3' | '4' | '5' | '6'
  education?: {
    highSchoolName?: string
    highSchoolLocation?: string
    highSchoolPeriod?: string
    highSchoolGraduationDate?: string
    associateInstitutionName?: string
    associateInstitutionLocation?: string
    associateInstitutionPeriod?: string
    associateInstitutionGraduationDate?: string
  }
  universityChoices?: {
    embassyChoices?: Array<{
      university?: string
      fieldOfStudy?: string
      department?: string
      other?: string
    }>
    universityChoice?: {
      university?: string
      fieldOfStudy?: string
      department?: string
      other?: string
    }
  }
  form2PersonalStatement?: string
  form3StudyPlan?: {
    languageStudyPlan?: string
    goalStudyPlan?: string
    futurePlan?: string
  }
  form5ConsentGroup?: {
    agreementsAccepted?: boolean[]
    personalDataConsent?: 'agree' | 'disagree'
    sensitiveInfoConsent?: 'agree' | 'disagree'
  }
  form6MedicalSample?: {
    answers?: MedicalSampleAnswerMap
    anyYes?: boolean
    explanation?: string
  }
  previousKoreaVisit?: boolean
  previousScholarship?: boolean
}

export interface FieldValidationMetadata {
  pattern?: 'email' | 'phone' | 'english-text' | 'iso-date'
  minLength?: number
  maxLength?: number
  minSelections?: number
  maxSelections?: number
  options?: readonly string[]
  optionScope?: Partial<Record<ApplicationTrack, readonly string[]>>
  requiresEnglishCharacters?: boolean
  allowsMultiple?: boolean
  itemCount?: number
  explanation?: string
}

export interface GksField {
  id: string
  formNumber: FormNumber
  sourceLabel: string
  sectionLabel: string
  fieldLabel: string
  fieldType: FieldType
  status: FieldStatus
  languagePolicy: LanguagePolicy
  trackCondition: TrackCondition
  validation: FieldValidationMetadata
  milestone: 0 | 1
  notes?: string
  isActive?: (
    context: Readonly<{
      track: ApplicationTrack
      profile?: Partial<ApplicantProfile>
    }>,
  ) => boolean
}

export const APPLICATION_CHECKLIST_ITEM_IDS = [
  'checklist.personalInformation',
  'checklist.applicationForm',
  'checklist.personalStatement',
  'checklist.studyPlan',
  'checklist.recommendationLetter',
  'checklist.consentAndMedicalForms',
] as const

export const GKS_FIELD_IDS = [
  ...APPLICATION_CHECKLIST_ITEM_IDS,
  'form1.section1.applicationTrack',
  'form1.section2.applicationType',
  'form1.section3.degree',
  'form1.section4.fieldOfStudy',
  'form1.section5.familyName',
  'form1.section5.givenName',
  'form1.section5.middleName',
  'form1.section5.photo',
  'form1.section5.dateOfBirth',
  'form1.section5.gender',
  'form1.section5.citizenship',
  'form1.section5.koreanCitizenshipApplicant',
  'form1.section5.koreanCitizenshipParents',
  'form1.section5.address',
  'form1.section5.phone',
  'form1.section5.email',
  'form1.section6.topikLevel',
  'form1.section6.topikTestDate',
  'form1.section6.englishTestType',
  'form1.section6.englishTestScore',
  'form1.section7.highSchoolName',
  'form1.section7.highSchoolLocation',
  'form1.section7.highSchoolPeriod',
  'form1.section7.highSchoolGraduationDate',
  'form1.section7.associateInstitutionName',
  'form1.section7.associateInstitutionLocation',
  'form1.section7.associateInstitutionPeriod',
  'form1.section7.associateInstitutionGraduationDate',
  'form1.section8.cgpa',
  'form1.section8.scorePercentile',
  'form1.section8.convertedCgpa',
  'form1.section8.gpaConfirmation',
  'form1.section8.semesterGpaEntries',
  'form1.section9.embassyChoice1.university',
  'form1.section9.embassyChoice1.fieldOfStudy',
  'form1.section9.embassyChoice1.department',
  'form1.section9.embassyChoice1.other',
  'form1.section9.embassyChoice2.university',
  'form1.section9.embassyChoice2.fieldOfStudy',
  'form1.section9.embassyChoice2.department',
  'form1.section9.embassyChoice2.other',
  'form1.section9.embassyChoice3.university',
  'form1.section9.embassyChoice3.fieldOfStudy',
  'form1.section9.embassyChoice3.department',
  'form1.section9.embassyChoice3.other',
  'form1.section9.universityChoice.university',
  'form1.section9.universityChoice.fieldOfStudy',
  'form1.section9.universityChoice.department',
  'form1.section9.universityChoice.other',
  'form1.section10.previousKoreaVisitDetails',
  'form1.section11.previousScholarshipDetails',
  'form2.section1.personalStatement',
  'form3.section1.languageStudyPlan',
  'form3.section2.goalStudyPlan',
  'form3.section3.futurePlan',
  'form4.section1.recommenderName',
  'form4.section1.recommenderPosition',
  'form4.section1.recommenderSchool',
  'form4.section1.recommenderEmail',
  'form4.section1.recommenderTel',
  'form5.section1.consentGroup',
  'form5.section1.personalDataConsent',
  'form5.section1.sensitiveInfoConsent',
  'form6.section1.medicalChecklist',
  'form6.section1.medicalExplanation',
] as const

export type GksFieldId = (typeof GKS_FIELD_IDS)[number]

const embassyApplicationTypes = ['general', 'overseas-koreans', 'r-gks'] as const
const universityApplicationTypes = ['uic', 'associate-degree'] as const
const degreeOptions = ['bachelor', 'associate'] as const
const fieldOfStudyOptions = [
  'humanities',
  'social-science',
  'natural-science',
  'arts-and-sports',
  'education',
  'medicine',
  'engineering',
  'ai',
] as const
const genderOptions = ['M', 'F'] as const
const topikOptions = ['1', '2', '3', '4', '5', '6'] as const
const englishTestOptions = ['toefl', 'ielts'] as const
const consentDecisionOptions = ['agree', 'disagree'] as const

const hasMedicalYesAnswer = (profile?: Partial<ApplicantProfile>) => {
  const form6 = profile?.form6MedicalSample

  if (!form6) {
    return false
  }

  if (typeof form6.anyYes === 'boolean') {
    return form6.anyYes
  }

  return Object.values(form6.answers ?? {}).some(Boolean)
}

const isAssociateDegree = (profile?: Partial<ApplicantProfile>) =>
  profile?.degree === 'associate' || profile?.applicationType === 'associate-degree'

const createField = <TId extends GksFieldId>(field: GksField & { id: TId }) => field

export const MILESTONE_1_FIELD_IDS = [
  'form1.section1.applicationTrack',
  'form1.section2.applicationType',
  'form1.section3.degree',
  'form1.section4.fieldOfStudy',
  'form1.section5.familyName',
  'form1.section5.givenName',
  'form1.section5.middleName',
  'form1.section5.dateOfBirth',
  'form1.section5.gender',
  'form1.section5.citizenship',
  'form1.section5.koreanCitizenshipApplicant',
  'form1.section5.koreanCitizenshipParents',
  'form1.section5.address',
  'form1.section5.phone',
  'form1.section5.email',
  'form1.section6.topikLevel',
  'form1.section7.highSchoolName',
  'form1.section7.highSchoolLocation',
  'form1.section7.highSchoolPeriod',
  'form1.section7.highSchoolGraduationDate',
  'form1.section7.associateInstitutionName',
  'form1.section7.associateInstitutionLocation',
  'form1.section7.associateInstitutionPeriod',
  'form1.section7.associateInstitutionGraduationDate',
  'form1.section9.embassyChoice1.university',
  'form1.section9.embassyChoice1.fieldOfStudy',
  'form1.section9.embassyChoice1.department',
  'form1.section9.embassyChoice1.other',
  'form1.section9.embassyChoice2.university',
  'form1.section9.embassyChoice2.fieldOfStudy',
  'form1.section9.embassyChoice2.department',
  'form1.section9.embassyChoice2.other',
  'form1.section9.embassyChoice3.university',
  'form1.section9.embassyChoice3.fieldOfStudy',
  'form1.section9.embassyChoice3.department',
  'form1.section9.embassyChoice3.other',
  'form1.section9.universityChoice.university',
  'form1.section9.universityChoice.fieldOfStudy',
  'form1.section9.universityChoice.department',
  'form1.section9.universityChoice.other',
  'form2.section1.personalStatement',
  'form3.section1.languageStudyPlan',
  'form3.section2.goalStudyPlan',
  'form3.section3.futurePlan',
  'form5.section1.consentGroup',
  'form6.section1.medicalChecklist',
] as const satisfies readonly GksFieldId[]

export const GKS_FIELDS = [
  createField({
    id: 'checklist.personalInformation',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Personal information document set',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for personal information submission.' },
    milestone: 0,
  }),
  createField({
    id: 'checklist.applicationForm',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Application form package',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for Form 1 submission.' },
    milestone: 0,
  }),
  createField({
    id: 'checklist.personalStatement',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Personal Statement attachment',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for Form 2 submission.' },
    milestone: 0,
  }),
  createField({
    id: 'checklist.studyPlan',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Study Plan attachment',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for Form 3 submission.' },
    milestone: 0,
  }),
  createField({
    id: 'checklist.recommendationLetter',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Recommendation letter package',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for recommender documents.' },
    milestone: 0,
  }),
  createField({
    id: 'checklist.consentAndMedicalForms',
    formNumber: 'checklist',
    sourceLabel: '2026 GKS-U Application Checklist',
    sectionLabel: 'Checklist',
    fieldLabel: 'Consent and medical forms',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Checklist coverage item for Forms 5 and 6.' },
    milestone: 0,
  }),
  createField({
    id: 'form1.section1.applicationTrack',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Application Track',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: ['embassy', 'university'],
      minSelections: 1,
      maxSelections: 1,
      explanation: 'Track selection controls downstream conditional sections.',
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section2.applicationType',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 2',
    fieldLabel: 'Application Type',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      minSelections: 1,
      maxSelections: 1,
      optionScope: {
        embassy: embassyApplicationTypes,
        university: universityApplicationTypes,
      },
      explanation: 'Available options depend on the selected application track.',
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section3.degree',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 3',
    fieldLabel: 'Degree',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: degreeOptions,
      minSelections: 1,
      maxSelections: 1,
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section4.fieldOfStudy',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 4',
    fieldLabel: 'Field of Study',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: fieldOfStudyOptions,
      minSelections: 1,
      allowsMultiple: true,
      explanation: 'Form 1 permits selecting one or more study categories.',
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.familyName',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Family Name',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'english-text', maxLength: 100, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.givenName',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Given Name',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'english-text', maxLength: 100, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.middleName',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Middle Name',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'english-text', maxLength: 100, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.photo',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Photo',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Attachment placeholder for applicant photo.' },
    milestone: 0,
  }),
  createField({
    id: 'form1.section5.dateOfBirth',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Date of Birth',
    fieldType: 'date',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'iso-date' },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.gender',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Gender',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: genderOptions,
      minSelections: 1,
      maxSelections: 1,
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.citizenship',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Country of Citizenship',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'english-text', maxLength: 100, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.koreanCitizenshipApplicant',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Applicant holds Korean citizenship',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: ['yes', 'no'],
      minSelections: 1,
      maxSelections: 1,
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.koreanCitizenshipParents',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Parents hold Korean citizenship',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: {
      options: ['yes', 'no'],
      minSelections: 1,
      maxSelections: 1,
    },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.address',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Address',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 500, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.phone',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Phone',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'phone', maxLength: 40 },
    milestone: 1,
  }),
  createField({
    id: 'form1.section5.email',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 5',
    fieldLabel: 'Email',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'email', maxLength: 254 },
    milestone: 1,
  }),
  createField({
    id: 'form1.section6.topikLevel',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 6',
    fieldLabel: 'TOPIK Level',
    fieldType: 'checkbox',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { options: topikOptions, minSelections: 0, maxSelections: 1 },
    milestone: 1,
  }),
  createField({
    id: 'form1.section6.topikTestDate',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 6',
    fieldLabel: 'TOPIK Test Date',
    fieldType: 'date',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'iso-date' },
    milestone: 0,
  }),
  createField({
    id: 'form1.section6.englishTestType',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 6',
    fieldLabel: 'English Test Type',
    fieldType: 'checkbox',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { options: englishTestOptions, minSelections: 0, maxSelections: 1 },
    milestone: 0,
  }),
  createField({
    id: 'form1.section6.englishTestScore',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 6',
    fieldLabel: 'English Test Score',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 40 },
    milestone: 0,
  }),
  createField({
    id: 'form1.section7.highSchoolName',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'High School Name',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section7.highSchoolLocation',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'High School Location',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section7.highSchoolPeriod',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'High School Period',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 120, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section7.highSchoolGraduationDate',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'High School Graduation Date',
    fieldType: 'date',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'iso-date' },
    milestone: 1,
  }),
  createField({
    id: 'form1.section7.associateInstitutionName',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'Associate Degree Institution Name',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
    isActive: ({ profile }) => isAssociateDegree(profile),
  }),
  createField({
    id: 'form1.section7.associateInstitutionLocation',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'Associate Degree Institution Location',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
    isActive: ({ profile }) => isAssociateDegree(profile),
  }),
  createField({
    id: 'form1.section7.associateInstitutionPeriod',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'Associate Degree Institution Period',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 120, requiresEnglishCharacters: true },
    milestone: 1,
    isActive: ({ profile }) => isAssociateDegree(profile),
  }),
  createField({
    id: 'form1.section7.associateInstitutionGraduationDate',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 7',
    fieldLabel: 'Associate Degree Graduation Date',
    fieldType: 'date',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { pattern: 'iso-date' },
    milestone: 1,
    isActive: ({ profile }) => isAssociateDegree(profile),
  }),
  createField({
    id: 'form1.section8.cgpa',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 8',
    fieldLabel: 'CGPA',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 40 },
    milestone: 0,
  }),
  createField({
    id: 'form1.section8.scorePercentile',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 8',
    fieldLabel: 'Score Percentile',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 40 },
    milestone: 0,
  }),
  createField({
    id: 'form1.section8.convertedCgpa',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 8',
    fieldLabel: 'Converted CGPA',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 40 },
    milestone: 0,
  }),
  createField({
    id: 'form1.section8.gpaConfirmation',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 8',
    fieldLabel: 'GPA Confirmation',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { explanation: 'Applicant confirms GPA conversion details.' },
    milestone: 0,
  }),
  createField({
    id: 'form1.section8.semesterGpaEntries',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 8',
    fieldLabel: 'Per-semester GPA entries',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { explanation: 'Inventory coverage for semester-by-semester GPA rows.' },
    milestone: 0,
  }),
  createField({
    id: 'form1.section9.embassyChoice1.university',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 1 University',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice1.fieldOfStudy',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 1 Field of Study',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice1.department',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 1 Department',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice1.other',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 1 Other',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice2.university',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 2 University',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice2.fieldOfStudy',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 2 Field of Study',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice2.department',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 2 Department',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice2.other',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 2 Other',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice3.university',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 3 University',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice3.fieldOfStudy',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 3 Field of Study',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice3.department',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 3 Department',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.embassyChoice3.other',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 Embassy Track',
    fieldLabel: 'Embassy Choice 3 Other',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'embassy',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.universityChoice.university',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 University Track',
    fieldLabel: 'University Track Choice University',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'university',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.universityChoice.fieldOfStudy',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 University Track',
    fieldLabel: 'University Track Choice Field of Study',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'university',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.universityChoice.department',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 University Track',
    fieldLabel: 'University Track Choice Department',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'english-only',
    trackCondition: 'university',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section9.universityChoice.other',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 9 University Track',
    fieldLabel: 'University Track Choice Other',
    fieldType: 'text',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'university',
    validation: { maxLength: 200, requiresEnglishCharacters: true },
    milestone: 1,
  }),
  createField({
    id: 'form1.section10.previousKoreaVisitDetails',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 10',
    fieldLabel: 'Previous Korea Visit Details',
    fieldType: 'multiline',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 500 },
    milestone: 0,
    isActive: ({ profile }) => profile?.previousKoreaVisit === true,
  }),
  createField({
    id: 'form1.section11.previousScholarshipDetails',
    formNumber: 1,
    sourceLabel: 'FORM 1. APPLICATION',
    sectionLabel: 'Section 11',
    fieldLabel: 'Previous Scholarship Details',
    fieldType: 'multiline',
    status: 'optional',
    languagePolicy: 'english-only',
    trackCondition: 'both',
    validation: { maxLength: 500 },
    milestone: 0,
    isActive: ({ profile }) => profile?.previousScholarship === true,
  }),
  createField({
    id: 'form2.section1.personalStatement',
    formNumber: 2,
    sourceLabel: 'FORM 2. PERSONAL STATEMENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Personal Statement',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'korean-or-english',
    trackCondition: 'both',
    validation: { minLength: 1, maxLength: 8000 },
    milestone: 1,
  }),
  createField({
    id: 'form3.section1.languageStudyPlan',
    formNumber: 3,
    sourceLabel: 'FORM 3. STUDY PLAN',
    sectionLabel: 'Section 1',
    fieldLabel: 'Language Study Plan',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'korean-or-english',
    trackCondition: 'both',
    validation: { minLength: 1, maxLength: 5000 },
    milestone: 1,
  }),
  createField({
    id: 'form3.section2.goalStudyPlan',
    formNumber: 3,
    sourceLabel: 'FORM 3. STUDY PLAN',
    sectionLabel: 'Section 2',
    fieldLabel: 'Goal and Study Plan',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'korean-or-english',
    trackCondition: 'both',
    validation: { minLength: 1, maxLength: 5000 },
    milestone: 1,
  }),
  createField({
    id: 'form3.section3.futurePlan',
    formNumber: 3,
    sourceLabel: 'FORM 3. STUDY PLAN',
    sectionLabel: 'Section 3',
    fieldLabel: 'Future Plan after Study',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'korean-or-english',
    trackCondition: 'both',
    validation: { minLength: 1, maxLength: 5000 },
    milestone: 1,
  }),
  createField({
    id: 'form4.section1.recommenderName',
    formNumber: 4,
    sourceLabel: 'FORM 4. LETTER OF RECOMMENDATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Recommender Name',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { maxLength: 120 },
    milestone: 0,
  }),
  createField({
    id: 'form4.section1.recommenderPosition',
    formNumber: 4,
    sourceLabel: 'FORM 4. LETTER OF RECOMMENDATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Recommender Position',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { maxLength: 120 },
    milestone: 0,
  }),
  createField({
    id: 'form4.section1.recommenderSchool',
    formNumber: 4,
    sourceLabel: 'FORM 4. LETTER OF RECOMMENDATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Recommender School',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { maxLength: 160 },
    milestone: 0,
  }),
  createField({
    id: 'form4.section1.recommenderEmail',
    formNumber: 4,
    sourceLabel: 'FORM 4. LETTER OF RECOMMENDATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Recommender Email',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { pattern: 'email', maxLength: 254 },
    milestone: 0,
  }),
  createField({
    id: 'form4.section1.recommenderTel',
    formNumber: 4,
    sourceLabel: 'FORM 4. LETTER OF RECOMMENDATION',
    sectionLabel: 'Section 1',
    fieldLabel: 'Recommender Tel',
    fieldType: 'text',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { pattern: 'phone', maxLength: 40 },
    milestone: 0,
  }),
  createField({
    id: 'form5.section1.consentGroup',
    formNumber: 5,
    sourceLabel: 'FORM 5. PERSONAL MEDICAL ASSESSMENT AND CONSENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Agreement Checkbox Group',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: {
      itemCount: 15,
      minSelections: 15,
      maxSelections: 15,
      explanation: 'Represents the 15 agreement items in Form 5.',
    },
    milestone: 1,
  }),
  createField({
    id: 'form5.section1.personalDataConsent',
    formNumber: 5,
    sourceLabel: 'FORM 5. PERSONAL MEDICAL ASSESSMENT AND CONSENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Personal Data Consent',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { options: consentDecisionOptions, minSelections: 1, maxSelections: 1 },
    milestone: 0,
  }),
  createField({
    id: 'form5.section1.sensitiveInfoConsent',
    formNumber: 5,
    sourceLabel: 'FORM 5. PERSONAL MEDICAL ASSESSMENT AND CONSENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Sensitive Information Consent',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: { options: consentDecisionOptions, minSelections: 1, maxSelections: 1 },
    milestone: 0,
  }),
  createField({
    id: 'form6.section1.medicalChecklist',
    formNumber: 6,
    sourceLabel: 'FORM 6. MEDICAL ASSESSMENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Medical Yes/No Checklist',
    fieldType: 'checkbox',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: {
      itemCount: 15,
      explanation: 'Represents the 15 medical assessment yes/no questions.',
    },
    milestone: 1,
  }),
  createField({
    id: 'form6.section1.medicalExplanation',
    formNumber: 6,
    sourceLabel: 'FORM 6. MEDICAL ASSESSMENT',
    sectionLabel: 'Section 1',
    fieldLabel: 'Medical Condition Explanation',
    fieldType: 'multiline',
    status: 'required',
    languagePolicy: 'none',
    trackCondition: 'both',
    validation: {
      minLength: 1,
      maxLength: 2000,
      explanation: 'Only active when at least one medical checklist answer is yes.',
    },
    milestone: 0,
    isActive: ({ profile }) => hasMedicalYesAnswer(profile),
  }),
] as const satisfies readonly GksField[]

export const getFieldById = (fieldId: GksFieldId) =>
  GKS_FIELDS.find((field) => field.id === fieldId)

export const isFieldActive = (
  field: GksField,
  track: ApplicationTrack,
  profile?: Partial<ApplicantProfile>,
) => {
  if (field.trackCondition !== 'both' && field.trackCondition !== track) {
    return false
  }

  if (!field.isActive) {
    return true
  }

  return field.isActive({ track, profile })
}

export const getActiveFields = (
  track: ApplicationTrack,
  profile?: Partial<ApplicantProfile>,
) => GKS_FIELDS.filter((field) => isFieldActive(field, track, profile))

export const getMilestoneFields = (
  track: ApplicationTrack,
  profile?: Partial<ApplicantProfile>,
) => getActiveFields(track, profile).filter((field) => field.milestone === 1)

export const getDuplicateFieldIds = (fields: readonly GksField[] = GKS_FIELDS) => {
  const counts = new Map<string, number>()

  for (const field of fields) {
    counts.set(field.id, (counts.get(field.id) ?? 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([fieldId]) => fieldId)
}
