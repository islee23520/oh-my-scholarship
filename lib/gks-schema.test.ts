import {
  GKS_FIELDS,
  MILESTONE_1_FIELD_IDS,
  getActiveFields,
  getDuplicateFieldIds,
  getMilestoneFields,
} from './gks-schema'

describe('gks-schema', () => {
  it('has no duplicate field IDs across the full inventory', () => {
    expect(getDuplicateFieldIds()).toEqual([])
  })

  it('activates embassy-only university choice fields and deactivates university-only fields', () => {
    const activeIds = new Set(getActiveFields('embassy').map((field) => field.id))

    expect(activeIds).toContain('form1.section9.embassyChoice1.university')
    expect(activeIds).toContain('form1.section9.embassyChoice2.university')
    expect(activeIds).toContain('form1.section9.embassyChoice3.university')
    expect(activeIds).not.toContain('form1.section9.universityChoice.university')
    expect(activeIds).not.toContain('form1.section9.universityChoice.department')
  })

  it('activates university-only university choice fields and deactivates embassy-only fields', () => {
    const activeIds = new Set(getActiveFields('university').map((field) => field.id))

    expect(activeIds).toContain('form1.section9.universityChoice.university')
    expect(activeIds).toContain('form1.section9.universityChoice.department')
    expect(activeIds).not.toContain('form1.section9.embassyChoice1.university')
    expect(activeIds).not.toContain('form1.section9.embassyChoice2.university')
    expect(activeIds).not.toContain('form1.section9.embassyChoice3.university')
  })

  it('activates profile-conditional fields only when the profile requires them', () => {
    const defaultIds = new Set(getActiveFields('university').map((field) => field.id))

    expect(defaultIds).not.toContain('form1.section7.associateInstitutionName')
    expect(defaultIds).not.toContain('form6.section1.medicalExplanation')

    const associateIds = new Set(
      getActiveFields('university', { degree: 'associate' }).map((field) => field.id),
    )
    expect(associateIds).toContain('form1.section7.associateInstitutionName')
    expect(associateIds).toContain('form1.section7.associateInstitutionGraduationDate')

    const medicalIds = new Set(
      getActiveFields('embassy', {
        form6MedicalSample: { anyYes: true },
      }).map((field) => field.id),
    )
    expect(medicalIds).toContain('form6.section1.medicalExplanation')
  })

  it('covers all required milestone 1 field areas in the active milestone schema', () => {
    const embassyMilestoneIds = new Set(
      getMilestoneFields('embassy', { degree: 'bachelor' }).map((field) => field.id),
    )
    const universityMilestoneIds = new Set(
      getMilestoneFields('university', { degree: 'associate' }).map((field) => field.id),
    )

    expect(embassyMilestoneIds).toContain('form1.section1.applicationTrack')
    expect(embassyMilestoneIds).toContain('form1.section2.applicationType')
    expect(embassyMilestoneIds).toContain('form2.section1.personalStatement')
    expect(embassyMilestoneIds).toContain('form5.section1.consentGroup')
    expect(embassyMilestoneIds).toContain('form6.section1.medicalChecklist')
    expect(embassyMilestoneIds).toContain('form1.section9.embassyChoice3.department')
    expect(universityMilestoneIds).toContain('form1.section9.universityChoice.university')
    expect(universityMilestoneIds).toContain('form1.section7.associateInstitutionName')

    for (const fieldId of MILESTONE_1_FIELD_IDS) {
      const existsInInventory = GKS_FIELDS.some((field) => field.id === fieldId)

      expect(existsInInventory).toBe(true)
    }
  })
})
