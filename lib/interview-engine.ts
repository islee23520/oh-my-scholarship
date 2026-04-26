import {
  getMilestoneFields,
  type ApplicantProfile,
  type ApplicationTrack,
  type GksField,
  type GksFieldId,
} from './gks-schema'

export type InterviewPhaseId =
  | 'identity'
  | 'contact'
  | 'application'
  | 'education'
  | 'university-choices'
  | 'language'
  | 'essays'
  | 'consent-medical'

export interface InterviewPhasePlan {
  id: InterviewPhaseId
  label: string
  description: string
  currentField: GksField
  pendingFieldIds: GksFieldId[]
  pendingFieldLabels: string[]
  completedFieldCount: number
  totalFieldCount: number
}

const INTERVIEW_PHASE_METADATA: Record<InterviewPhaseId, { label: string; description: string }> = {
  identity: {
    label: 'Identity Details',
    description: 'Collect the applicant’s official personal identity information.',
  },
  contact: {
    label: 'Contact Details',
    description: 'Collect the applicant’s address, phone number, and email address.',
  },
  application: {
    label: 'Application Basics',
    description: 'Confirm track, application type, degree, and study field choices.',
  },
  education: {
    label: 'Education History',
    description: 'Collect the applicant’s academic institution and graduation details.',
  },
  'university-choices': {
    label: 'University Choices',
    description: 'Collect the intended university, field, and department choices.',
  },
  language: {
    label: 'Language Background',
    description: 'Collect the applicant’s available language test information.',
  },
  essays: {
    label: 'Essay Materials',
    description: 'Collect the personal statement and study plan content.',
  },
  'consent-medical': {
    label: 'Consent and Medical',
    description: 'Collect the final consent confirmation and medical checklist status.',
  },
}

export const getInterviewPhaseId = (fieldId: GksFieldId): InterviewPhaseId => {
  switch (fieldId) {
    case 'form1.section1.applicationTrack':
    case 'form1.section2.applicationType':
    case 'form1.section3.degree':
    case 'form1.section4.fieldOfStudy':
      return 'application'
    case 'form1.section5.familyName':
    case 'form1.section5.givenName':
    case 'form1.section5.middleName':
    case 'form1.section5.dateOfBirth':
    case 'form1.section5.gender':
    case 'form1.section5.citizenship':
    case 'form1.section5.koreanCitizenshipApplicant':
    case 'form1.section5.koreanCitizenshipParents':
      return 'identity'
    case 'form1.section5.address':
    case 'form1.section5.phone':
    case 'form1.section5.email':
      return 'contact'
    case 'form1.section6.topikLevel':
      return 'language'
    case 'form1.section7.highSchoolName':
    case 'form1.section7.highSchoolLocation':
    case 'form1.section7.highSchoolPeriod':
    case 'form1.section7.highSchoolGraduationDate':
    case 'form1.section7.associateInstitutionName':
    case 'form1.section7.associateInstitutionLocation':
    case 'form1.section7.associateInstitutionPeriod':
    case 'form1.section7.associateInstitutionGraduationDate':
      return 'education'
    case 'form1.section9.embassyChoice1.university':
    case 'form1.section9.embassyChoice1.fieldOfStudy':
    case 'form1.section9.embassyChoice1.department':
    case 'form1.section9.embassyChoice1.other':
    case 'form1.section9.embassyChoice2.university':
    case 'form1.section9.embassyChoice2.fieldOfStudy':
    case 'form1.section9.embassyChoice2.department':
    case 'form1.section9.embassyChoice2.other':
    case 'form1.section9.embassyChoice3.university':
    case 'form1.section9.embassyChoice3.fieldOfStudy':
    case 'form1.section9.embassyChoice3.department':
    case 'form1.section9.embassyChoice3.other':
    case 'form1.section9.universityChoice.university':
    case 'form1.section9.universityChoice.fieldOfStudy':
    case 'form1.section9.universityChoice.department':
    case 'form1.section9.universityChoice.other':
      return 'university-choices'
    case 'form2.section1.personalStatement':
    case 'form3.section1.languageStudyPlan':
    case 'form3.section2.goalStudyPlan':
    case 'form3.section3.futurePlan':
      return 'essays'
    case 'form5.section1.consentGroup':
    case 'form6.section1.medicalChecklist':
      return 'consent-medical'
    default:
      return 'application'
  }
}

export const isFieldAnswered = (profile: Partial<ApplicantProfile>, fieldId: GksFieldId): boolean => {
  switch (fieldId) {
    case 'form1.section1.applicationTrack': return !!profile.applicationTrack;
    case 'form1.section2.applicationType': return !!profile.applicationType;
    case 'form1.section3.degree': return !!profile.degree;
    case 'form1.section4.fieldOfStudy': return !!profile.fieldOfStudy && profile.fieldOfStudy.length > 0;
    case 'form1.section5.familyName': return !!profile.fullNameEnglish?.familyName;
    case 'form1.section5.givenName': return !!profile.fullNameEnglish?.givenName;
    case 'form1.section5.middleName': return !!profile.fullNameEnglish?.middleName;
    case 'form1.section5.dateOfBirth': return !!profile.dateOfBirth;
    case 'form1.section5.gender': return !!profile.gender;
    case 'form1.section5.citizenship': return !!profile.citizenship;
    case 'form1.section5.koreanCitizenshipApplicant': return profile.koreanCitizenshipApplicant !== undefined;
    case 'form1.section5.koreanCitizenshipParents': return profile.koreanCitizenshipParents !== undefined;
    case 'form1.section5.address': return !!profile.address;
    case 'form1.section5.phone': return !!profile.phone;
    case 'form1.section5.email': return !!profile.email;
    case 'form1.section6.topikLevel': return !!profile.topikLevel;
    case 'form1.section7.highSchoolName': return !!profile.education?.highSchoolName;
    case 'form1.section7.highSchoolLocation': return !!profile.education?.highSchoolLocation;
    case 'form1.section7.highSchoolPeriod': return !!profile.education?.highSchoolPeriod;
    case 'form1.section7.highSchoolGraduationDate': return !!profile.education?.highSchoolGraduationDate;
    case 'form1.section7.associateInstitutionName': return !!profile.education?.associateInstitutionName;
    case 'form1.section7.associateInstitutionLocation': return !!profile.education?.associateInstitutionLocation;
    case 'form1.section7.associateInstitutionPeriod': return !!profile.education?.associateInstitutionPeriod;
    case 'form1.section7.associateInstitutionGraduationDate': return !!profile.education?.associateInstitutionGraduationDate;
    case 'form1.section9.embassyChoice1.university': return !!profile.universityChoices?.embassyChoices?.[0]?.university;
    case 'form1.section9.embassyChoice1.fieldOfStudy': return !!profile.universityChoices?.embassyChoices?.[0]?.fieldOfStudy;
    case 'form1.section9.embassyChoice1.department': return !!profile.universityChoices?.embassyChoices?.[0]?.department;
    case 'form1.section9.embassyChoice1.other': return !!profile.universityChoices?.embassyChoices?.[0]?.other;
    case 'form1.section9.embassyChoice2.university': return !!profile.universityChoices?.embassyChoices?.[1]?.university;
    case 'form1.section9.embassyChoice2.fieldOfStudy': return !!profile.universityChoices?.embassyChoices?.[1]?.fieldOfStudy;
    case 'form1.section9.embassyChoice2.department': return !!profile.universityChoices?.embassyChoices?.[1]?.department;
    case 'form1.section9.embassyChoice2.other': return !!profile.universityChoices?.embassyChoices?.[1]?.other;
    case 'form1.section9.embassyChoice3.university': return !!profile.universityChoices?.embassyChoices?.[2]?.university;
    case 'form1.section9.embassyChoice3.fieldOfStudy': return !!profile.universityChoices?.embassyChoices?.[2]?.fieldOfStudy;
    case 'form1.section9.embassyChoice3.department': return !!profile.universityChoices?.embassyChoices?.[2]?.department;
    case 'form1.section9.embassyChoice3.other': return !!profile.universityChoices?.embassyChoices?.[2]?.other;
    case 'form1.section9.universityChoice.university': return !!profile.universityChoices?.universityChoice?.university;
    case 'form1.section9.universityChoice.fieldOfStudy': return !!profile.universityChoices?.universityChoice?.fieldOfStudy;
    case 'form1.section9.universityChoice.department': return !!profile.universityChoices?.universityChoice?.department;
    case 'form1.section9.universityChoice.other': return !!profile.universityChoices?.universityChoice?.other;
    case 'form2.section1.personalStatement': return !!profile.form2PersonalStatement;
    case 'form3.section1.languageStudyPlan': return !!profile.form3StudyPlan?.languageStudyPlan;
    case 'form3.section2.goalStudyPlan': return !!profile.form3StudyPlan?.goalStudyPlan;
    case 'form3.section3.futurePlan': return !!profile.form3StudyPlan?.futurePlan;
    case 'form5.section1.consentGroup': return !!profile.form5ConsentGroup?.agreementsAccepted && profile.form5ConsentGroup.agreementsAccepted.length > 0;
    case 'form6.section1.medicalChecklist': return profile.form6MedicalSample?.anyYes !== undefined;
    default: return false;
  }
}

export const updateProfileField = (
  profile: Partial<ApplicantProfile>,
  fieldId: GksFieldId,
  value: unknown,
): Partial<ApplicantProfile> => {
  const asString = (candidate: unknown) => (typeof candidate === 'string' ? candidate : String(candidate ?? ''))
  const asStringArray = (candidate: unknown) =>
    Array.isArray(candidate) ? candidate.map((entry) => asString(entry)) : [asString(candidate)]

  const p = JSON.parse(JSON.stringify(profile)) as Partial<ApplicantProfile>;
  switch (fieldId) {
    case 'form1.section1.applicationTrack': p.applicationTrack = value as ApplicantProfile['applicationTrack']; break;
    case 'form1.section2.applicationType': p.applicationType = value as ApplicantProfile['applicationType']; break;
    case 'form1.section3.degree': p.degree = value as ApplicantProfile['degree']; break;
    case 'form1.section4.fieldOfStudy': p.fieldOfStudy = asStringArray(value); break;
    case 'form1.section5.familyName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.familyName = asString(value); break;
    case 'form1.section5.givenName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.givenName = asString(value); break;
    case 'form1.section5.middleName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.middleName = asString(value); break;
    case 'form1.section5.dateOfBirth': p.dateOfBirth = asString(value); break;
    case 'form1.section5.gender': p.gender = value as ApplicantProfile['gender']; break;
    case 'form1.section5.citizenship': p.citizenship = asString(value); break;
    case 'form1.section5.koreanCitizenshipApplicant': p.koreanCitizenshipApplicant = value === 'yes' || value === true; break;
    case 'form1.section5.koreanCitizenshipParents': p.koreanCitizenshipParents = value === 'yes' || value === true; break;
    case 'form1.section5.address': p.address = asString(value); break;
    case 'form1.section5.phone': p.phone = asString(value); break;
    case 'form1.section5.email': p.email = asString(value); break;
    case 'form1.section6.topikLevel': p.topikLevel = value as ApplicantProfile['topikLevel']; break;
    case 'form1.section7.highSchoolName': p.education = p.education || {}; p.education.highSchoolName = asString(value); break;
    case 'form1.section7.highSchoolLocation': p.education = p.education || {}; p.education.highSchoolLocation = asString(value); break;
    case 'form1.section7.highSchoolPeriod': p.education = p.education || {}; p.education.highSchoolPeriod = asString(value); break;
    case 'form1.section7.highSchoolGraduationDate': p.education = p.education || {}; p.education.highSchoolGraduationDate = asString(value); break;
    case 'form1.section7.associateInstitutionName': p.education = p.education || {}; p.education.associateInstitutionName = asString(value); break;
    case 'form1.section7.associateInstitutionLocation': p.education = p.education || {}; p.education.associateInstitutionLocation = asString(value); break;
    case 'form1.section7.associateInstitutionPeriod': p.education = p.education || {}; p.education.associateInstitutionPeriod = asString(value); break;
    case 'form1.section7.associateInstitutionGraduationDate': p.education = p.education || {}; p.education.associateInstitutionGraduationDate = asString(value); break;
    case 'form1.section9.embassyChoice1.university': 
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].university = asString(value); break;
    case 'form1.section9.embassyChoice1.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].fieldOfStudy = asString(value); break;
    case 'form1.section9.embassyChoice1.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].department = asString(value); break;
    case 'form1.section9.embassyChoice1.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].other = asString(value); break;
    case 'form1.section9.embassyChoice2.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].university = asString(value); break;
    case 'form1.section9.embassyChoice2.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].fieldOfStudy = asString(value); break;
    case 'form1.section9.embassyChoice2.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].department = asString(value); break;
    case 'form1.section9.embassyChoice2.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].other = asString(value); break;
    case 'form1.section9.embassyChoice3.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].university = asString(value); break;
    case 'form1.section9.embassyChoice3.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].fieldOfStudy = asString(value); break;
    case 'form1.section9.embassyChoice3.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].department = asString(value); break;
    case 'form1.section9.embassyChoice3.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].other = asString(value); break;
    case 'form1.section9.universityChoice.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.university = asString(value); break;
    case 'form1.section9.universityChoice.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.fieldOfStudy = asString(value); break;
    case 'form1.section9.universityChoice.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.department = asString(value); break;
    case 'form1.section9.universityChoice.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.other = asString(value); break;
    case 'form2.section1.personalStatement': p.form2PersonalStatement = asString(value); break;
    case 'form3.section1.languageStudyPlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.languageStudyPlan = asString(value); break;
    case 'form3.section2.goalStudyPlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.goalStudyPlan = asString(value); break;
    case 'form3.section3.futurePlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.futurePlan = asString(value); break;
    case 'form5.section1.consentGroup': p.form5ConsentGroup = p.form5ConsentGroup || {}; p.form5ConsentGroup.agreementsAccepted = Array.isArray(value) ? value.map((entry) => Boolean(entry)) : [Boolean(value)]; break;
    case 'form6.section1.medicalChecklist': p.form6MedicalSample = p.form6MedicalSample || {}; p.form6MedicalSample.anyYes = value === 'yes' || value === true; break;
  }
  return p;
}

export const selectNextQuestion = (profile: Partial<ApplicantProfile>, track: ApplicationTrack): GksField | null => {
  const milestoneFields = getMilestoneFields(track, profile);
  
  for (const field of milestoneFields) {
    if (field.status === 'required' && !isFieldAnswered(profile, field.id)) {
      return field;
    }
  }
  
  return null;
}

export const planInterviewPhase = (
  profile: Partial<ApplicantProfile>,
  track: ApplicationTrack,
): InterviewPhasePlan | null => {
  const currentField = selectNextQuestion(profile, track)

  if (!currentField) {
    return null
  }

  const phaseId = getInterviewPhaseId(currentField.id as GksFieldId)
  const phaseFields = getMilestoneFields(track, profile).filter(
    (field) => getInterviewPhaseId(field.id as GksFieldId) === phaseId,
  )
  const pendingFields = phaseFields.filter((field) => !isFieldAnswered(profile, field.id as GksFieldId))
  const metadata = INTERVIEW_PHASE_METADATA[phaseId]

  return {
    id: phaseId,
    label: metadata.label,
    description: metadata.description,
    currentField,
    pendingFieldIds: pendingFields.map((field) => field.id as GksFieldId),
    pendingFieldLabels: pendingFields.map((field) => field.fieldLabel),
    completedFieldCount: phaseFields.length - pendingFields.length,
    totalFieldCount: phaseFields.length,
  }
}

export const getDeterministicKoreanQuestion = (field: GksField): string => {
  if (field.id === 'form5.section1.consentGroup') {
    return 'Please confirm that you accept all 15 agreement items before we continue.'
  }

  if (field.id === 'form6.section1.medicalChecklist') {
    return 'Do you have any medical condition or history that should be marked yes on the medical checklist?'
  }

  if (field.fieldType === 'checkbox') {
    return `Please choose the option that best matches your ${field.fieldLabel.toLowerCase()}.`
  }

  if (field.fieldType === 'date') {
    return `Please provide your ${field.fieldLabel} in YYYY-MM-DD format.`
  }

  return `Please provide your ${field.fieldLabel}.`
}
