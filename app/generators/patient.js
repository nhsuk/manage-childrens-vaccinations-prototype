import _ from 'lodash'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { PATIENT_OUTCOME } from '../enums.js'
import getAddress from './address.js'
import getChild from './child.js'
import getResponse from './response.js'
import { getYearGroup } from './year-group.js'

/**
 * @typedef {object} Patient
 * @property {string} nhsNumber - NHS number
 * @property {string} address - Address
 * @property {object} yearGroup - Response method
 * @property {[import('./response.js').Response]} responses - Parent
 * @property {object} consent - Consent outcome
 * @property {string} outcome - Overall patient outcome
 * @property {object} [seen] - Seen offline
 * @property {object} triage - Triage outcome
 */

/**
 * @private
 * @param {object} options - Patient options
 * @returns {Patient} Patient record
 */
const _getPatient = (options) => {
  const { minYearGroup, maxYearGroup, type } = options
  const patient = getChild(minYearGroup, maxYearGroup)

  let responses = faker.helpers.multiple(getResponse(type, patient), {
    count: { min: 0, max: 3 }
  })
  responses = _.uniqBy(responses, 'parentOrGuardian.relationship')

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  patient.nhsNumber = faker.helpers.replaceSymbolWithNumber('999#######')
  patient.address = getAddress()
  patient.yearGroup = getYearGroup(patient.dob)
  patient.responses = responses
  patient.consent = { events: [] }
  patient.outcome = PATIENT_OUTCOME.NO_OUTCOME_YET
  patient.seen = {}
  patient.triage = { notes: [] }

  // Mark 50% of records as ready for triaged
  patient.__triageOutcome = faker.helpers.maybe(() => true, {
    probability: 0.5
  })

  return patient
}

export default (options) => {
  const patient = () => ({
    ..._getPatient(options)
  })

  return patient
}
