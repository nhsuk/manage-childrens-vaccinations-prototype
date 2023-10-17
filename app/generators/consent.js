import _ from 'lodash'
import { CONSENT_OUTCOME, RESPONSE_CONSENT } from '../enums.js'

/**
 * @typedef {object} Consent
 * @property {string} outcome - Consent outcome, derived from responses
 * @property {boolean} answersNeedTriage - Answers need triage?
 * @property {Array} refusalReasons - Unique refusal reasons
 */

/**
 * Generate derived consent
 * @param {string} type - Campaign type
 * @param {Array} responses - Consent responses
 * @returns {Consent} Derived consent
 */
export default (type, responses) => {
  // Only derive consent from responses for this campaign type
  responses = _.uniqBy(responses, type)

  let outcome = CONSENT_OUTCOME.NO_RESPONSE

  if (responses.length === 1) {
    outcome = responses[0].status
  } else if (responses.length > 1) {
    const allConsented = _.uniqBy(responses, 'status') === RESPONSE_CONSENT.GIVEN
    if (allConsented) {
      outcome = CONSENT_OUTCOME.VALID
    }

    const allRefused = _.uniqBy(responses, 'status') === RESPONSE_CONSENT.REFUSED
    if (allRefused) {
      outcome = CONSENT_OUTCOME.REFUSED
    }

    outcome = CONSENT_OUTCOME.INCONSISTENT
  }

  // Build a list of health answers with responses
  const answersNeedingTriage = []
  if (outcome === CONSENT_OUTCOME.VALID) {
    for (const response of Object.values(responses)) {
      for (const [key, value] of Object.entries(response.healthAnswers)) {
        if (value !== false) {
          answersNeedingTriage.push(key)
        }
      }
    }
  }

  // Build a list of refusal reasons
  const refusalReasons = []
  if (outcome === CONSENT_OUTCOME.REFUSED) {
    for (const response of Object.values(responses)) {
      refusalReasons.push(response.refusalReason)
    }
  }

  const consent = {
    outcome,
    answersNeedTriage: answersNeedingTriage.length > 0,
    refusalReasons
  }

  return consent
}
