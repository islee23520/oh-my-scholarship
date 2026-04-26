import { getMilestoneFields, type ApplicantProfile, type ApplicationTrack, type GksField, type GksFieldId } from './gks-schema'

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

export const updateProfileField = (profile: Partial<ApplicantProfile>, fieldId: GksFieldId, value: any): Partial<ApplicantProfile> => {
  const p = JSON.parse(JSON.stringify(profile)) as Partial<ApplicantProfile>;
  switch (fieldId) {
    case 'form1.section1.applicationTrack': p.applicationTrack = value; break;
    case 'form1.section2.applicationType': p.applicationType = value; break;
    case 'form1.section3.degree': p.degree = value; break;
    case 'form1.section4.fieldOfStudy': p.fieldOfStudy = Array.isArray(value) ? value : [value]; break;
    case 'form1.section5.familyName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.familyName = value; break;
    case 'form1.section5.givenName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.givenName = value; break;
    case 'form1.section5.middleName': p.fullNameEnglish = p.fullNameEnglish || {}; p.fullNameEnglish.middleName = value; break;
    case 'form1.section5.dateOfBirth': p.dateOfBirth = value; break;
    case 'form1.section5.gender': p.gender = value; break;
    case 'form1.section5.citizenship': p.citizenship = value; break;
    case 'form1.section5.koreanCitizenshipApplicant': p.koreanCitizenshipApplicant = value === 'yes' || value === true; break;
    case 'form1.section5.koreanCitizenshipParents': p.koreanCitizenshipParents = value === 'yes' || value === true; break;
    case 'form1.section5.address': p.address = value; break;
    case 'form1.section5.phone': p.phone = value; break;
    case 'form1.section5.email': p.email = value; break;
    case 'form1.section6.topikLevel': p.topikLevel = value; break;
    case 'form1.section7.highSchoolName': p.education = p.education || {}; p.education.highSchoolName = value; break;
    case 'form1.section7.highSchoolLocation': p.education = p.education || {}; p.education.highSchoolLocation = value; break;
    case 'form1.section7.highSchoolPeriod': p.education = p.education || {}; p.education.highSchoolPeriod = value; break;
    case 'form1.section7.highSchoolGraduationDate': p.education = p.education || {}; p.education.highSchoolGraduationDate = value; break;
    case 'form1.section7.associateInstitutionName': p.education = p.education || {}; p.education.associateInstitutionName = value; break;
    case 'form1.section7.associateInstitutionLocation': p.education = p.education || {}; p.education.associateInstitutionLocation = value; break;
    case 'form1.section7.associateInstitutionPeriod': p.education = p.education || {}; p.education.associateInstitutionPeriod = value; break;
    case 'form1.section7.associateInstitutionGraduationDate': p.education = p.education || {}; p.education.associateInstitutionGraduationDate = value; break;
    case 'form1.section9.embassyChoice1.university': 
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].university = value; break;
    case 'form1.section9.embassyChoice1.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].fieldOfStudy = value; break;
    case 'form1.section9.embassyChoice1.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].department = value; break;
    case 'form1.section9.embassyChoice1.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[0].other = value; break;
    case 'form1.section9.embassyChoice2.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].university = value; break;
    case 'form1.section9.embassyChoice2.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].fieldOfStudy = value; break;
    case 'form1.section9.embassyChoice2.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].department = value; break;
    case 'form1.section9.embassyChoice2.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[1].other = value; break;
    case 'form1.section9.embassyChoice3.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].university = value; break;
    case 'form1.section9.embassyChoice3.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].fieldOfStudy = value; break;
    case 'form1.section9.embassyChoice3.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].department = value; break;
    case 'form1.section9.embassyChoice3.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.embassyChoices = p.universityChoices.embassyChoices || [{}, {}, {}];
      p.universityChoices.embassyChoices[2].other = value; break;
    case 'form1.section9.universityChoice.university':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.university = value; break;
    case 'form1.section9.universityChoice.fieldOfStudy':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.fieldOfStudy = value; break;
    case 'form1.section9.universityChoice.department':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.department = value; break;
    case 'form1.section9.universityChoice.other':
      p.universityChoices = p.universityChoices || {};
      p.universityChoices.universityChoice = p.universityChoices.universityChoice || {};
      p.universityChoices.universityChoice.other = value; break;
    case 'form2.section1.personalStatement': p.form2PersonalStatement = value; break;
    case 'form3.section1.languageStudyPlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.languageStudyPlan = value; break;
    case 'form3.section2.goalStudyPlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.goalStudyPlan = value; break;
    case 'form3.section3.futurePlan': p.form3StudyPlan = p.form3StudyPlan || {}; p.form3StudyPlan.futurePlan = value; break;
    case 'form5.section1.consentGroup': p.form5ConsentGroup = p.form5ConsentGroup || {}; p.form5ConsentGroup.agreementsAccepted = Array.isArray(value) ? value : [value]; break;
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

export const getDeterministicKoreanQuestion = (field: GksField): string => {
  return `다음으로 ${field.fieldLabel} 항목을 입력해 주세요.`;
}
