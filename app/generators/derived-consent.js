import _ from 'lodash'
import { CONSENT } from '../enums.js'

export default (type, consentResponses) => {
  // Only derive consent from responses for this campaign type
  consentResponses = _.uniqBy(consentResponses, type)

  let consent = CONSENT.UNKNOWN
  let consented // All responses consented
  let refused // All responses refused
  let inconsistent // All consent responses mixed

  if (consentResponses.length === 1) {
    consent = consentResponses[0][type]
    consented = consentResponses[0][type] === CONSENT.GIVEN
    refused = consentResponses[0][type] === CONSENT.REFUSED
  } else if (consentResponses.length > 1) {
    const allConsented = _.uniqBy(consentResponses, type) === CONSENT.GIVEN
    if (allConsented) {
      consent = CONSENT.GIVEN
      consented = true
    }

    const allRefused = _.uniqBy(consentResponses, type) === CONSENT.REFUSED
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
    for (consent of Object.values(consentResponses)) {
      for (const [key, value] of Object.entries(consent.healthAnswers)) {
        if (value !== false) {
          answersNeedingTriage.push(key)
        }
      }
    }
  }

  const derivedConsent = {
    [type]: consent,
    text: consent,
    refused,
    consented,
    inconsistent,
    unknown: consentResponses.length === 0,
    responses: consentResponses.length > 0,
    answersNeedTriage: answersNeedingTriage.length > 0,
    ...(type === '3-in-1 and MenACWY') && {
      refusedBoth: consent === CONSENT.REFUSED,
      both: consent === CONSENT.GIVEN
    }
  }

  return derivedConsent
}
