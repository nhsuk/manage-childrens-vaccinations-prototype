import { fakerEN_GB as faker } from '@faker-js/faker'
import { TRIAGE_OUTCOME } from '../enums.js'
import getNote from '../generators/note.js'

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
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) {
    patient.triage.outcome = TRIAGE_OUTCOME.VACCINATE

    patient.triage.notes.push(getNote(patient.__triageNote))

    delete patient.__triageNote
  }
}
