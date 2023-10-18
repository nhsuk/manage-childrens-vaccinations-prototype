import _ from 'lodash'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { PATIENT_OUTCOME } from '../enums.js'
import getAddress from './address.js'
import getChild from './child.js'
import getResponse from './response.js'
import { getYearGroup } from './year-group.js'

const getPatient = (options) => {
  const { minYearGroup, maxYearGroup, type } = options
  const patient = getChild(minYearGroup, maxYearGroup)

  let responses = faker.helpers.multiple(getResponse(type, patient), {
    count: { min: 0, max: 4 }
  })
  responses = _.uniqBy(responses, 'parentOrGuardian.relationship')

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  patient.nhsNumber = faker.helpers.replaceSymbolWithNumber('999#######')
  patient.address = getAddress()
  patient.yearGroup = getYearGroup(patient.dob)
  patient.responses = responses
  patient.consent = { notes: [] }
  patient.outcome = PATIENT_OUTCOME.NO_OUTCOME_YET
  patient.seen = {}
  patient.triage = { notes: [] }

  return patient
}

export default (options) => {
  const patient = () => ({
    ...getPatient(options)
  })

  return patient
}
