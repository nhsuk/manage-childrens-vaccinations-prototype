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
  BUTTOCK_LEFT: 'Left buttock',
  BUTTOCK_RIGHT: 'Right buttock',
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
  ABSENT: 'Absent',
  UNWELL: 'Unwell',
  NO_CONSENT: 'Unable to contact parent',
  LATE_CONSENT: 'Consent received too late'
}

export const CONSENT_OUTCOME = {
  NO_RESPONSE: 'No response',
  GIVEN: 'Consent given',
  REFUSED: 'Consent refused',
  FINAL_REFUSAL: 'Confirmed refusal, do not contact',
  INCONSISTENT: 'Conflicting consent',
  ONLY_MENACWY: 'Only MenACWY',
  ONLY_3_IN_1: 'Only 3-in-1'
}

export const PATIENT_OUTCOME = {
  NO_OUTCOME_YET: 'No outcome yet',
  NO_CONSENT: 'No consent given',
  VACCINATED: 'Vaccinated',
  COULD_NOT_VACCINATE: 'Could not vaccinate'
}

export const RESPONSE_CONSENT = {
  GIVEN: 'Consent given',
  REFUSED: 'Consent refused',
  INVALID: 'Consent invalid',
  ONLY_MENACWY: 'Consent given for MenACWY only',
  ONLY_3_IN_1: 'Consent given for 3-in-1 only'
}

export const RESPONSE_METHOD = {
  WEBSITE: 'Website',
  TEXT: 'Text message',
  CALL: 'Voice call',
  PERSON: 'In person',
  PAPER: 'Paper'
}

export const RESPONSE_REFUSAL = {
  GELATINE: 'Vaccine contains gelatine from pigs',
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
