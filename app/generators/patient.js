import _ from 'lodash'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { ACTION_NEEDED, PATIENT_OUTCOME, TRIAGE_OUTCOME } from '../enums.js'
import getAddress from './address.js'
import getChild from './child.js'
import getResponse from './response.js'
import getDerivedConsent from './derived-consent.js'
import { getYearGroup } from './year-group.js'

const getActionNeeded = (consent) => {
  if (consent.refused) {
    return ACTION_NEEDED.CHECK_REFUSAL
  } else if (consent.unknown) {
    return ACTION_NEEDED.GET_CONSENT
  } else if (consent.inconsistent) {
    return ACTION_NEEDED.CHECK_CONFLICTING
  }
}

const handleInProgressTriage = (patient) => {
  // Only relevant to children needing triage
  if (!patient.consent.consented && !patient.triageStatus === TRIAGE_OUTCOME.NEEDS_TRIAGE) {
    return
  }

  // Only half done
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) {
    return
  }

  // Set triage outcome to vaccinate
  patient.triageStatus = faker.helpers.weightedArrayElement([
    { value: TRIAGE_OUTCOME.NEEDS_TRIAGE, weight: 1 },
    { value: TRIAGE_OUTCOME.VACCINATE, weight: 1 }
  ])

  // Add realistic triage note
  if (patient.__triageNote) {
    patient.triageNotes.push({
      date: faker.date.recent({ days: 30 }),
      note: patient.__triageNote,
      user: {
        name: 'James Davidson',
        email: 'james.davidson@example.com'
      }
    })

    delete patient.__triageNote
  }

  // A small number still need follow-up triage, the rest can vaccinate
  if (faker.helpers.maybe(() => true, { probability: 0.8 })) {
    patient.triageStatus = TRIAGE_OUTCOME.VACCINATE
  }
}

export default (options) => {
  const { minYearGroup, maxYearGroup, triageInProgress, type } = options
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
  patient.consent = getDerivedConsent(type, responses)
  patient.outcome = PATIENT_OUTCOME.NO_OUTCOME_YET

  patient.actionNeeded = getActionNeeded(patient.consent)

  patient.seen = {}

  patient.triageNotes = []
  patient.triageStatus = patient.consent.answersNeedTriage
    ? TRIAGE_OUTCOME.NEEDS_TRIAGE
    : false

  if (triageInProgress) {
    handleInProgressTriage(patient)
  }

  return patient
}
