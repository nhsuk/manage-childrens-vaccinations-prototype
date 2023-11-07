import _ from 'lodash'
import { CONSENT_OUTCOME, RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'

/**
 * @typedef {object} Consent
 * @property {string} outcome - Consent outcome, derived from responses
 * @property {Array} refusalReasons - Unique refusal reasons
 * @property {Array} notes - Consent notes
 */

/**
 * Generate derived consent
 * @param {object} patient - Patient record
 * @returns {Consent} Derived consent
 */
export default (patient) => {
  const { consent, responses } = patient

  let outcome = CONSENT_OUTCOME.NO_RESPONSE

  if (responses?.length === 1) {
    outcome = responses[0].status
  } else if (responses.length > 1) {
    const uniqueStatuses = _.uniqBy(responses, 'status')

    if (uniqueStatuses.length > 1) {
      if (uniqueStatuses.find(response => response.status === RESPONSE_CONSENT.FINAL_REFUSAL)) {
        outcome = CONSENT_OUTCOME.FINAL_REFUSAL
      } else {
        outcome = CONSENT_OUTCOME.INCONSISTENT
      }
    } else if (uniqueStatuses[0].status === RESPONSE_CONSENT.GIVEN) {
      outcome = CONSENT_OUTCOME.GIVEN
    } else if (uniqueStatuses[0].status === RESPONSE_CONSENT.REFUSED) {
      outcome = CONSENT_OUTCOME.REFUSED
    }
  }

  // Build a list of health answers with responses
  const answersNeedingTriage = []
  if (outcome === CONSENT_OUTCOME.GIVEN) {
    for (const response of Object.values(responses)) {
      for (const [key, value] of Object.entries(response.healthAnswers)) {
        if (value !== false) {
          answersNeedingTriage.push(key)
        }
      }
    }

    if (answersNeedingTriage.length > 0 && !patient.triage.completed) {
      patient.triage.outcome = TRIAGE_OUTCOME.NEEDS_TRIAGE
      patient.triage.completed = true
    }
  }

  // Build a list of refusal reasons
  const refusalReasons = []
  if (outcome === CONSENT_OUTCOME.REFUSED || outcome === CONSENT_OUTCOME.FINAL_REFUSAL) {
    for (const response of Object.values(responses)) {
      refusalReasons.push(response.refusalReason)
    }
    consent.refusalReasons = [...new Set(refusalReasons)]
  }

  // Add value to indicate presence of health answers
  consent.hasHealthAnswers = responses.filter(response => response.healthAnswers).length > 0

  patient.consent = {
    ...consent,
    outcome
  }
}
