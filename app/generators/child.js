import { fakerEN_GB as faker } from '@faker-js/faker'
import { OUTCOME, CONSENT, ACTION_NEEDED } from '../enums.js'
import { getDateOfBirth, getYearGroup, getAge } from './age.js'
import getPerson from './person.js'
import getAddress from './address.js'
import getConsent from './consent.js'
import getTriageStatus from './triage-status.js'
import getGp from './gp.js'
import getHealthQuestions from './health-questions.js'
import getTriageNeeded from './triage-needed.js'

const preferredName = (child) => {
  return `${child.firstName} ${faker.person.lastName()}`
}

const setActions = (child, consent) => {
  if (consent === CONSENT.REFUSED) {
    child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
  } else if (consent === CONSENT.UNKNOWN) {
    child.actionNeeded = ACTION_NEEDED.GET_CONSENT
  } else if (consent === CONSENT.GIVEN) {
    child.actionNeeded = ACTION_NEEDED.VACCINATE
  }
}

const handleInProgressTriage = (child) => {
  // Only relevant to children needing triage
  if (!child.needsTriage) return

  // Only half done
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) return

  // Activate triage notes
  if (child.healthQuestions.inactiveTriageNote) {
    child.triageNotes.push({
      date: faker.date.recent({ days: 30 }),
      note: child.healthQuestions.inactiveTriageNote,
      user: {
        name: 'James Davidson',
        email: 'james.davidson@example.com'
      }
    })

    delete child.healthQuestions.inactiveTriageNote
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
  const isChild = true
  const child = getPerson(faker, isChild)

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  child.nhsNumber = faker.phone.number('999#######')
  child.preferredName = faker.helpers.maybe(() => preferredName(child), { probability: 0.1 })
  child.address = getAddress(faker)
  child.gp = getGp(faker)
  child.dob = getDateOfBirth(faker, options)
  child.age = getAge(child.dob)
  child.yearGroup = getYearGroup(child.dob)
  child.consent = getConsent(faker, options.type, child.lastName)
  child.outcome = OUTCOME.NO_OUTCOME_YET

  setActions(child, child.consent[options.type])
  child.actionTaken = null

  child.seen = {}
  child.triageNotes = []
  child.triageStatus = getTriageStatus(options.triageInProgress, child.consent)
  child.healthQuestions = getHealthQuestions(faker, options.type, child)

  getTriageNeeded(faker, child)
  if (options.triageInProgress) {
    handleInProgressTriage(child)
  }

  return child
}
