import _ from 'lodash'
import { CONSENT_OUTCOME, RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'

/**
 * @typedef {object} Consent
 * @property {string} outcome - Consent outcome, derived from responses
 * @property {Array} refusalReasons - Unique refusal reasons
 * @property {Array} events - Consent events
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
  const refusalReasonsDetailed = []
  if (outcome === CONSENT_OUTCOME.REFUSED || outcome === CONSENT_OUTCOME.FINAL_REFUSAL) {
    for (const response of Object.values(responses)) {
      if (!response.refusalReason) { continue }

      const { refusalReason, refusalReasonOther } = response

      const refusalReasonDetail = refusalReason === 'Other'
        ? `Other – ${refusalReasonOther}`
        : refusalReason

      refusalReasons.push(refusalReason)
      refusalReasonsDetailed.push(refusalReasonDetail)
    }
    // Refusal reasons (short)
    consent.refusalReasons = [...new Set(refusalReasons)]

    // Refusal reasons (with other provided details)
    consent.refusalReasonsDetailed = [...new Set(refusalReasonsDetailed)]
  }

  // Add value to indicate presence of health answers
  consent.hasHealthAnswers = responses.filter(response => response.healthAnswers).length > 0

  // Add Gillick assessment outcome
  consent.isGillickCompetent = responses.filter(response => response.gillickCompetent === 'Yes').length > 0

  consent.isNotGillickCompetent = responses.filter(response => response.gillickCompetent === 'No').length > 0

  patient.consent = {
    ...consent,
    outcome
  }
}
