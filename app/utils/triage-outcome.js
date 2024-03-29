import { TRIAGE_OUTCOME } from '../enums.js'
import getEvent from '../fakers/event.js'

/**
 * Update patient record with triage outcome
 * @param {object} patient - Patient record
 * @returns {object} Updated patient record
 */
export default (patient) => {
  // Only relevant to patients needing triage
  if (patient.triage.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE) {
    return
  }

  // Triage half, adding triage note and changing outcome to VACCINATE
  if (patient.__triageOutcome) {
    patient.triage.outcome = TRIAGE_OUTCOME.VACCINATE
    patient.triage.completed = true

    // Add example triage note if not already added
    if (patient.__triageNote) {
      patient.triage.events.push(getEvent(patient.__triageNote, { days: 30 }))
      delete patient.__triageNote
    }
  }
}
