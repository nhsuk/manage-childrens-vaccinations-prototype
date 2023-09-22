import { fakerEN_GB as faker } from '@faker-js/faker'
import { OUTCOME, CONSENT, ACTION_NEEDED } from '../enums.js'
import { getDateOfBirth, getYearGroup, getAge } from './age.js'
import getPerson from './person.js'
import getAddress from './address.js'
import getConsent from './consent.js'
import getConsentResponses from './consent-responses.js'
import getTriageStatus from './triage-status.js'
import getGp from './gp.js'
import getTriageNeeded from './triage-needed.js'

const preferredName = (child) => {
  return `${child.firstName} ${faker.person.lastName()}`
}

const getActionNeeded = (consent) => {
  if (consent.refused) {
    return ACTION_NEEDED.CHECK_REFUSAL
  } else if (consent.unknown) {
    return ACTION_NEEDED.GET_CONSENT
  } else if (consent.consented) {
    return ACTION_NEEDED.VACCINATE
  }
}

const handleInProgressTriage = (child) => {
  // Only relevant to children needing triage
  if (!child.needsTriage) return

  // Only half done
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) return

  // Add realistic triage note
  if (child.__triageNote) {
    child.triageNotes.push({
      date: faker.date.recent({ days: 30 }),
      note: child.__triageNote,
      user: {
        name: 'James Davidson',
        email: 'james.davidson@example.com'
      }
    })

    delete child.__triageNote
  }

  // A small number need follow-ups
  if (faker.helpers.maybe(() => true, { probability: 0.2 })) {
    child.actionNeeded = ACTION_NEEDED.FOLLOW_UP
  } else {
    child.triageCompleted = true
    child.actionNeeded = ACTION_NEEDED.VACCINATE
  }
}

export default (options) => {
  const { triageInProgress, type } = options
  const isChild = true
  const child = getPerson(faker, isChild)

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  child.nhsNumber = faker.helpers.replaceSymbolWithNumber('999#######')
  child.preferredName = faker.helpers.maybe(() => preferredName(child), { probability: 0.1 })
  child.address = getAddress(faker)
  child.gp = getGp(faker)
  child.dob = getDateOfBirth(faker, options)
  child.age = getAge(child.dob)
  child.yearGroup = getYearGroup(child.dob)
  child.consent = getConsent(type)
  child.consentResponses = getConsentResponses(faker, {
    type, child, count: faker.number.int({ min: 1, max: 3 })
  })
  child.outcome = OUTCOME.NO_OUTCOME_YET

  child.actionNeeded = getActionNeeded(child.consent[type])
  child.actionTaken = null

  child.seen = {}
  child.triageNotes = []
  child.triageStatus = getTriageStatus(triageInProgress, child.consent)

  getTriageNeeded(faker, child)
  if (triageInProgress) {
    handleInProgressTriage(child)
  }

  return child
}
