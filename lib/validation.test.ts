import { describe, expect, it } from 'vitest'

import { getFieldById, type ApplicantProfile } from './gks-schema'
import { generateCompletionReport, validateField } from './validation'

const requireField = (fieldId: Parameters<typeof getFieldById>[0]) => {
  const field = getFieldById(fieldId)

  expect(field).toBeDefined()

  return field!
}

const createBaseProfile = (
  overrides: Partial<ApplicantProfile> = {},
): Partial<ApplicantProfile> => ({
  applicationTrack: 'embassy',
  applicationType: 'general',
  degree: 'bachelor',
  fieldOfStudy: ['engineering'],
  fullNameEnglish: {
    familyName: 'HONG',
    givenName: 'GIL DONG',
  },
  dateOfBirth: '2000-01-01',
  gender: 'M',
  citizenship: 'KAZAKHSTAN',
  koreanCitizenshipApplicant: false,
  koreanCitizenshipParents: false,
  address: '123 GLOBAL STREET',
  phone: '+82-10-1234-5678',
  email: 'hong@example.com',
  education: {
    highSchoolName: 'GLOBAL HIGH SCHOOL',
    highSchoolLocation: 'ALMATY',
    highSchoolPeriod: '2016-2019',
    highSchoolGraduationDate: '2019-06-01',
  },
  universityChoices: {
    embassyChoices: [
      {
        university: 'KOREA UNIVERSITY',
        fieldOfStudy: 'ENGINEERING',
        department: 'COMPUTER SCIENCE',
      },
      {
        university: 'YONSEI UNIVERSITY',
        fieldOfStudy: 'ENGINEERING',
        department: 'ARTIFICIAL INTELLIGENCE',
      },
      {
        university: 'SNU',
        fieldOfStudy: 'ENGINEERING',
        department: 'ELECTRICAL ENGINEERING',
      },
    ],
  },
  form2PersonalStatement: 'Personal statement draft in English.',
  form3StudyPlan: {
    languageStudyPlan: 'Language study plan in English.',
    goalStudyPlan: 'Goal and study plan in English.',
    futurePlan: 'Future plan in English.',
  },
  form5ConsentGroup: {
    agreementsAccepted: Array.from({ length: 15 }, () => true),
  },
  form6MedicalSample: {
    anyYes: false,
  },
  ...overrides,
})

describe('validation', () => {
  it('rejects non-ascii FORM 1 values for english-only fields', () => {
    const result = validateField(
      'form1.section5.givenName',
      '홍길동',
      requireField('form1.section5.givenName'),
    )

    expect(result).toEqual({
      status: 'invalid',
      errors: ['ENGLISH_ONLY'],
    })
  })

  it('allows ascii FORM 1 values for english-only fields', () => {
    const result = validateField(
      'form1.section5.givenName',
      'HONG GIL DONG',
      requireField('form1.section5.givenName'),
    )

    expect(result).toEqual({
      status: 'valid',
      errors: [],
    })
  })

  it('allows Korean draft text for FORM 2 and FORM 3 fields', () => {
    const personalStatement = validateField(
      'form2.section1.personalStatement',
      '이것은 한국어 초안입니다.',
      requireField('form2.section1.personalStatement'),
    )
    const studyPlan = validateField(
      'form3.section1.languageStudyPlan',
      '한국어로 작성한 학업 계획입니다.',
      requireField('form3.section1.languageStudyPlan'),
    )

    expect(personalStatement.status).toBe('valid')
    expect(studyPlan.status).toBe('valid')
  })

  it('flags invalid dates and invalid emails', () => {
    const invalidDate = validateField(
      'form1.section5.dateOfBirth',
      '2000/01/01',
      requireField('form1.section5.dateOfBirth'),
    )
    const invalidEmail = validateField(
      'form1.section5.email',
      'not-an-email',
      requireField('form1.section5.email'),
    )

    expect(invalidDate).toEqual({
      status: 'invalid',
      errors: ['INVALID_DATE'],
    })
    expect(invalidEmail).toEqual({
      status: 'invalid',
      errors: ['INVALID_EMAIL'],
    })
  })

  it('reports missing required fields as missing and invalid email as invalid', () => {
    const report = generateCompletionReport(
      createBaseProfile({
        dateOfBirth: undefined,
        email: 'broken-email',
      }),
      'embassy',
    )

    expect(report.missing).toContain('form1.section5.dateOfBirth')
    expect(report.invalid).toContainEqual({
      fieldId: 'form1.section5.email',
      errors: ['INVALID_EMAIL'],
    })
    expect(report.missing).not.toContain('form1.section5.email')
    expect(report.readyForDocxProof).toBe(false)
  })

  it('tracks skipped and required fields accurately for university track conditions', () => {
    const report = generateCompletionReport(
      createBaseProfile({
        applicationTrack: 'university',
        applicationType: 'uic',
        universityChoices: {
          universityChoice: {
            university: 'KAIST',
            fieldOfStudy: 'ENGINEERING',
          },
        },
      }),
      'university',
    )

    expect(report.skipped).toContain('form1.section9.embassyChoice1.university')
    expect(report.skipped).toContain('form1.section9.embassyChoice3.department')
    expect(report.missing).toContain('form1.section9.universityChoice.department')
    expect(report.missing).not.toContain('form1.section9.embassyChoice1.university')
    expect(report.readyForDocxProof).toBe(false)
  })
})
