import { fakerEN_GB as faker } from '@faker-js/faker'
import { OUTCOME, ACTION_NEEDED } from '../enums.js'
import getAddress from './address.js'
import getChild from './child.js'
import getResponses from './responses.js'
import getDerivedConsent from './derived-consent.js'
import getTriageStatus from './triage-status.js'
import getTriageNeeded from './triage-needed.js'
import { getYearGroup } from './year-group.js'

const getActionNeeded = (consent) => {
  if (consent.refused) {
    return ACTION_NEEDED.CHECK_REFUSAL
  } else if (consent.unknown) {
    return ACTION_NEEDED.GET_CONSENT
  } else if (consent.consented) {
    return ACTION_NEEDED.VACCINATE
  }
}

const handleInProgressTriage = (patient) => {
  // Only relevant to children needing triage
  if (!patient.consent.consented && !patient.needsTriage) {
    return
  }

  // Only half done
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) return

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

  // A small number need follow-ups
  if (faker.helpers.maybe(() => true, { probability: 0.2 })) {
    patient.actionNeeded = ACTION_NEEDED.FOLLOW_UP
  } else {
    patient.triageCompleted = true
    patient.actionNeeded = ACTION_NEEDED.VACCINATE
  }
}

export default (options) => {
  const { minYearGroup, maxYearGroup, triageInProgress, type } = options
  const patient = getChild(minYearGroup, maxYearGroup)
  const responses = getResponses(faker, {
    type, patient, count: faker.number.int({ min: 0, max: 4 })
  })

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  patient.nhsNumber = faker.helpers.replaceSymbolWithNumber('999#######')
  patient.address = getAddress()
  patient.yearGroup = getYearGroup(patient.dob)
  patient.responses = responses
  patient.consent = getDerivedConsent(type, responses)
  patient.outcome = OUTCOME.NO_OUTCOME_YET

  patient.actionNeeded = getActionNeeded(patient.consent)
  patient.actionTaken = null

  patient.seen = {}
  patient.triageNotes = []
  patient.triageStatus = getTriageStatus(triageInProgress)

  getTriageNeeded(patient)
  if (triageInProgress) {
    handleInProgressTriage(patient)
  }

  return patient
}
