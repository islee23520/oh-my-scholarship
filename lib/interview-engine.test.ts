import { describe, it, expect } from 'vitest'
import { selectNextQuestion, isFieldAnswered, updateProfileField, getDeterministicKoreanQuestion } from './interview-engine'
import type { ApplicantProfile, GksField } from './gks-schema'

describe('interview-engine', () => {
  describe('selectNextQuestion', () => {
    it('returns the first unanswered required field', () => {
      const profile: Partial<ApplicantProfile> = {}
      const nextField = selectNextQuestion(profile, 'embassy')
      expect(nextField).not.toBeNull()
      expect(nextField?.id).toBe('form1.section1.applicationTrack')
    })

    it('returns null when all required fields are answered', () => {
      const profile: Partial<ApplicantProfile> = {
        applicationTrack: 'embassy',
      }
      const nextField = selectNextQuestion(profile, 'embassy')
      expect(nextField).not.toBeNull()
      expect(nextField?.id).toBe('form1.section2.applicationType')
    })

    it('selects embassy specific fields for embassy track', () => {
      const profile: Partial<ApplicantProfile> = {
        applicationTrack: 'embassy',
        applicationType: 'general',
        degree: 'bachelor',
        fieldOfStudy: ['engineering'],
        fullNameEnglish: { familyName: 'Doe', givenName: 'John' },
        dateOfBirth: '2000-01-01',
        gender: 'M',
        citizenship: 'USA',
        koreanCitizenshipApplicant: false,
        koreanCitizenshipParents: false,
        address: '123 Main St',
        phone: '1234567890',
        email: 'john@example.com',
        education: {
          highSchoolName: 'HS',
          highSchoolLocation: 'Loc',
          highSchoolPeriod: '2015-2019',
          highSchoolGraduationDate: '2019-05-01'
        }
      }
      const nextField = selectNextQuestion(profile, 'embassy')
      expect(nextField?.id).toBe('form1.section9.embassyChoice1.university')
    })

    it('selects university specific fields for university track', () => {
      const profile: Partial<ApplicantProfile> = {
        applicationTrack: 'university',
        applicationType: 'general',
        degree: 'bachelor',
        fieldOfStudy: ['engineering'],
        fullNameEnglish: { familyName: 'Doe', givenName: 'John' },
        dateOfBirth: '2000-01-01',
        gender: 'M',
        citizenship: 'USA',
        koreanCitizenshipApplicant: false,
        koreanCitizenshipParents: false,
        address: '123 Main St',
        phone: '1234567890',
        email: 'john@example.com',
        education: {
          highSchoolName: 'HS',
          highSchoolLocation: 'Loc',
          highSchoolPeriod: '2015-2019',
          highSchoolGraduationDate: '2019-05-01'
        }
      }
      const nextField = selectNextQuestion(profile, 'university')
      expect(nextField?.id).toBe('form1.section9.universityChoice.university')
    })
  })

  describe('isFieldAnswered', () => {
    it('correctly identifies answered fields', () => {
      const profile: Partial<ApplicantProfile> = {
        applicationTrack: 'embassy'
      }
      expect(isFieldAnswered(profile, 'form1.section1.applicationTrack')).toBe(true)
      expect(isFieldAnswered(profile, 'form1.section2.applicationType')).toBe(false)
    })
  })

  describe('updateProfileField', () => {
    it('updates a simple field', () => {
      const profile: Partial<ApplicantProfile> = {}
      const updated = updateProfileField(profile, 'form1.section1.applicationTrack', 'embassy')
      expect(updated.applicationTrack).toBe('embassy')
    })

    it('updates a nested field', () => {
      const profile: Partial<ApplicantProfile> = {}
      const updated = updateProfileField(profile, 'form1.section5.familyName', 'Smith')
      expect(updated.fullNameEnglish?.familyName).toBe('Smith')
    })
  })

  describe('getDeterministicKoreanQuestion', () => {
    it('returns a formatted string', () => {
      const field = { fieldLabel: 'Test Label' } as GksField
      expect(getDeterministicKoreanQuestion(field)).toBe('다음으로 Test Label 항목을 입력해 주세요.')
    })
  })
})
