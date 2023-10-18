import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import { RESPONSE_CONSENT, RESPONSE_REFUSAL, RESPONSE_METHOD } from '../enums.js'
import getHealthAnswers from './health-answers.js'
import getParent from './parent.js'

/**
 * @typedef {object} Response
 * @property {string} date - Response date (ISO 8601)
 * @property {string} status - Response status
 * @property {string} method - Response method
 * @property {import('./parent.js').Parent} parentOrGuardian - Parent
 * @property {object} [healthAnswers] - Health answers
 * @property {string} [refusalReason] - Refusal reason
 * @property {string} [refusalReasonOther] - Refusal reason details
 */

/**
 * @private
 * @param {string} type - Campaign type
 * @returns {string} Consent status
 */
const _getStatus = (type) => {
  switch (type) {
    case '3-in-1 and MenACWY':
      return faker.helpers.weightedArrayElement([
        { value: RESPONSE_CONSENT.GIVEN, weight: 5 },
        { value: RESPONSE_CONSENT.ONLY_MENACWY, weight: 5 },
        { value: RESPONSE_CONSENT.ONLY_3_IN_1, weight: 5 },
        { value: RESPONSE_CONSENT.REFUSED, weight: 2 }
      ])
    default:
      return faker.helpers.weightedArrayElement([
        { value: RESPONSE_CONSENT.GIVEN, weight: 2 },
        { value: RESPONSE_CONSENT.REFUSED, weight: 1 }
      ])
  }
}

/**
 * @private
 * @param {string} type - Campaign type
 * @returns {string} Refusal reason
 */
const _getRefusalReason = (type) => {
  // Gelatine content only a valid refusal reason for flu campaign
  const refusalReasons = Object.values(RESPONSE_REFUSAL)
    .filter(a => (type !== 'Flu') ? a !== RESPONSE_REFUSAL.GELATINE : a)
  return faker.helpers.arrayElement(refusalReasons)
}

/**
 * Generate consent response
 * @param {string} type - Vaccine type
 * @param {object} patient - Patient record
 * @returns {Response} Consent response
 */
const _getResponse = (type, patient) => {
  const status = _getStatus(type)
  const refusalReason = _getRefusalReason(type)
  const method = faker.helpers.weightedArrayElement([
    { value: RESPONSE_METHOD.WEBSITE, weight: 5 },
    { value: RESPONSE_METHOD.TEXT, weight: 1 },
    { value: RESPONSE_METHOD.CALL, weight: 1 },
    { value: RESPONSE_METHOD.PERSON, weight: 1 },
    { value: RESPONSE_METHOD.PAPER, weight: 1 }
  ])
  const days = faker.number.int({ min: 10, max: 35 })

  const response = {
    date: DateTime.local().minus({ days }).toISODate(),
    status,
    method,
    parentOrGuardian: getParent(patient),
    ...(status === RESPONSE_CONSENT.GIVEN) && {
      healthAnswers: getHealthAnswers(type, patient)
    },
    ...(status === RESPONSE_CONSENT.REFUSED) && {
      refusalReason,
      ...(refusalReason === RESPONSE_REFUSAL.OTHER) && {
        refusalReasonOther: 'My family rejects vaccinations on principle.'
      }
    }
  }

  return response
}

export default (type, patient) => {
  const response = () => ({
    ..._getResponse(type, patient)
  })

  return response
}
