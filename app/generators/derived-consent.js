import _ from 'lodash'
import { CONSENT } from '../enums.js'

export default (type, responses) => {
  // Only derive consent from responses for this campaign type
  responses = _.uniqBy(responses, type)

  let consent = CONSENT.UNKNOWN
  let consented // All responses consented
  let refused // All responses refused
  let inconsistent // All consent responses mixed

  if (responses.length === 1) {
    consent = responses[0][type]
    consented = responses[0][type] === CONSENT.GIVEN
    refused = responses[0][type] === CONSENT.REFUSED
  } else if (responses.length > 1) {
    const allConsented = _.uniqBy(responses, type) === CONSENT.GIVEN
    if (allConsented) {
      consent = CONSENT.GIVEN
      consented = true
    }

    const allRefused = _.uniqBy(responses, type) === CONSENT.REFUSED
    if (allRefused) {
      consent = CONSENT.REFUSED
      refused = true
    }

    consent = CONSENT.INCONSISTENT
    inconsistent = true
  }

  // Build a list of health answers with responses
  const answersNeedingTriage = []
  if (consented) {
    for (consent of Object.values(responses)) {
      for (const [key, value] of Object.entries(consent.healthAnswers)) {
        if (value !== false) {
          answersNeedingTriage.push(key)
        }
      }
    }
  }

  // Build a list of refusal reasons
  const refusalReasons = []
  if (refused) {
    for (consent of Object.values(responses)) {
      refusalReasons.push(consent.reason)
    }
  }

  const derivedConsent = {
    [type]: consent,
    text: consent,
    refused,
    consented,
    inconsistent,
    unknown: responses.length === 0,
    responses: responses.length > 0,
    answersNeedTriage: answersNeedingTriage.length > 0,
    refusalReasons,
    ...(type === '3-in-1 and MenACWY') && {
      refusedBoth: consent === CONSENT.REFUSED,
      both: consent === CONSENT.GIVEN
    }
  }

  return derivedConsent
}
