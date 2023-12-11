export const PATIENT_OUTCOME = {
  NO_OUTCOME_YET: 'No outcome yet',
  VACCINATED: 'Vaccinated',
  COULD_NOT_VACCINATE: 'Could not vaccinate'
}

export const TRIAGE_OUTCOME = {
  NEEDS_TRIAGE: 'Needs triage',
  DELAY_VACCINATION: 'Delay vaccination to a later date',
  DO_NOT_VACCINATE: 'Do not vaccinate in campaign',
  VACCINATE: 'Safe to vaccinate'
}

export const VACCINATION_SITE = {
  NOSE: 'Nasal',
  ARM_LEFT: 'Left arm',
  ARM_LEFT_UPPER: 'Left arm (upper position)',
  ARM_LEFT_LOWER: 'Left arm (lower position)',
  ARM_RIGHT: 'Right arm',
  ARM_RIGHT_UPPER: 'Right arm (upper position)',
  ARM_RIGHT_LOWER: 'Right arm (lower position)',
  THIGH_LEFT: 'Left thigh',
  THIGH_RIGHT: 'Right thigh',
  OTHER: 'Other'
}

export const VACCINATION_OUTCOME = {
  VACCINATED: 'Vaccinated',
  PART_VACCINATED: 'Partially vaccinated',
  ALREADY_VACCINATED: 'Already had the vaccine',
  CONTRAINDICATIONS: 'Had contraindications',
  REFUSED: 'Refused vaccine',
  ABSENT_SCHOOL: 'Absent from school',
  ABSENT_SESSION: 'Absent from the session',
  UNWELL: 'Unwell',
  NO_CONSENT: 'Unable to contact parent',
  LATE_CONSENT: 'Consent received too late'
}

export const CONSENT_OUTCOME = {
  NO_RESPONSE: 'No response',
  GIVEN: 'Consent given',
  REFUSED: 'Consent refused',
  FINAL_REFUSAL: 'Refusal confirmed',
  INCONSISTENT: 'Conflicting consent',
  ONLY_MENACWY: 'Only MenACWY',
  ONLY_3_IN_1: 'Only 3-in-1'
}

export const RESPONSE_CONSENT = {
  GIVEN: 'Consent given',
  REFUSED: 'Consent refused',
  FINAL_REFUSAL: 'Refusal confirmed',
  INVALID: 'Consent invalid',
  NO_RESPONSE: 'No response',
  ONLY_MENACWY: 'Consent given for MenACWY only',
  ONLY_3_IN_1: 'Consent given for 3-in-1 only'
}

export const RESPONSE_METHOD = {
  WEBSITE: 'Online',
  CALL: 'By phone',
  PAPER: 'Paper form'
}

export const RESPONSE_REFUSAL = {
  GELATINE: 'Vaccine contains gelatine',
  ALREADY_GIVEN: 'Vaccine already received',
  GETTING_ELSEWHERE: 'Vaccine will be given elsewhere',
  MEDICAL: 'Medical reasons',
  PERSONAL: 'Personal choice',
  OTHER: 'Other'
}

export const PARENTAL_RELATIONSHIP = {
  MUM: 'Mum',
  DAD: 'Dad',
  STEP_PARENT: 'Step-parent',
  GRANDPARENT: 'Grandparent',
  GUARDIAN: 'Guardian',
  CARER: 'Carer',
  OTHER: 'Other'
}

export const CONTACT_PREFERENCE = {
  NONE: 'No preference',
  TEXT: 'Text message',
  CALL: 'Voice call',
  OTHER: 'Other'
}
