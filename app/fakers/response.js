import { faker } from '@faker-js/faker'
import { RESPONSE_CONSENT, RESPONSE_REFUSAL, RESPONSE_METHOD } from '../enums.js'
import getEvent from './event.js'
import getHealthAnswers from './health-answers.js'
import getParent from './parent.js'

/**
 * @typedef {object} Response
 * @property {string} status - Response status
 * @property {import('./parent.js').Parent} parentOrGuardian - Parent
 * @property {object} [healthAnswers] - Health answers
 * @property {string} [refusalReason] - Refusal reason
 * @property {string} [refusalReasonOther] - Refusal reason details
 * @property {Array} events - Event log
 */

/**
 * @private
 * @param {string} type - Session type
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
 * @param {string} type - Session type
 * @returns {string} Refusal reason
 */
const _getRefusalReason = (type) => {
  // Gelatine content only a valid refusal reason for flu vaccine
  const refusalReasons = Object.values(RESPONSE_REFUSAL)
    .filter(a => (type !== 'Flu') ? a !== RESPONSE_REFUSAL.GELATINE : a)
  return faker.helpers.arrayElement(refusalReasons)
}

/**
 * Generate consent response
 * @param {string} type - Vaccine type
 * @param {object} options - Response options
 * @param {object} [options.patient] - Patient record
 * @param {object} [options.status] - Response status
 * @param {boolean} [options.unmatched] - Unmatched response
 * @returns {Response} Consent response
 */
const _getResponse = (type, options) => {
  const status = options.status || _getStatus(type)

  // Add modified child details to an unmatched response
  const isUnmatchedResponse = options.unmatched
  const child = structuredClone(options.patient)
  child.lastName = faker.person.lastName()
  child.fullName = `${child.firstName} ${child.lastName}`
  delete child.responses

  const refusalReason = _getRefusalReason(type)
  const method = faker.helpers.weightedArrayElement([
    { value: RESPONSE_METHOD.WEBSITE, weight: 5 },
    { value: RESPONSE_METHOD.CALL, weight: 1 },
    { value: RESPONSE_METHOD.PAPER, weight: 1 }
  ])
  const days = faker.number.int({ min: 10, max: 35 })

  const user = getParent(options.patient)

  const response = {
    id: faker.string.uuid(),
    date: faker.date.recent({ days: 50 }),
    status,
    ...isUnmatchedResponse && {
      child,
      archived: faker.helpers.weightedArrayElement([
        { weight: 9, value: false },
        { weight: 1, value: true }
      ])
    },
    parentOrGuardian: user,
    ...(status === RESPONSE_CONSENT.GIVEN) && {
      healthAnswers: getHealthAnswers(type, options.patient)
    },
    ...(status === RESPONSE_CONSENT.REFUSED) && {
      refusalReason,
      ...(refusalReason === RESPONSE_REFUSAL.OTHER) && {
        refusalReasonOther: 'My family rejects vaccinations on principle.'
      }
    },
    events: [getEvent(`${status} (${method.toLowerCase()})`, { days, user })]
  }

  return response
}

export default (type, options) => {
  const response = () => ({
    ..._getResponse(type, options)
  })

  return response
}
