import { CONSENT_OUTCOME, PATIENT_OUTCOME, TRIAGE_OUTCOME } from '../enums.js'

/**
 * Update patient record with overall outcome
 * @param {object} patient - Patient record
 * @returns {object} Updated patient record
 */
export default (patient) => {
  // Update outcome if final refusal for consent given
  if (patient.consent.outcome === CONSENT_OUTCOME.FINAL_REFUSAL) {
    patient.outcome = PATIENT_OUTCOME.NO_CONSENT
  }

  // Update outcome if triage outcome is could not vaccinate
  // TODO: What about delayed vaccination outcome?
  if (patient.triage.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE) {
    patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
  }

  return patient
}
