import person from './person.js'
import parent from './parent.js'
import address from './address.js'
import consent from './consent.js'
import triageStatus from './triage-status.js'
import gp from './gp.js'
import healthQuestions from './health-questions.js'
import { dateOfBirth, yearGroup, age } from './age.js'
import triageNeeded from './triage-needed.js'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import { OUTCOME, CONSENT, ACTION_NEEDED } from '../enums.js'

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
  if (child.healthQuestions.inactiveTriage) {
    child.healthQuestions.triage = child.healthQuestions.inactiveTriage
    delete child.healthQuestions.inactiveTriage
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
  const c = person(faker, isChild)

  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  c.nhsNumber = faker.phone.number('999#######')
  c.preferredName = faker.helpers.maybe(() => preferredName(c), { probability: 0.1 })
  c.address = address(faker)
  c.gp = gp(faker)
  c.dob = dateOfBirth(faker, options)
  c.age = age(c.dob)
  c.yearGroup = yearGroup(c.dob)
  c.consent = consent(faker, options.type)
  c.outcome = OUTCOME.NO_OUTCOME_YET

  setActions(c, c.consent[options.type])
  c.actionTaken = null

  c.seen = {}
  c.triageStatus = triageStatus(options.triageInProgress, c.consent)
  c.healthQuestions = healthQuestions(faker, options.type, c)
  triageNeeded(faker, c)
  if (options.triageInProgress) {
    handleInProgressTriage(c)
  }

  const days = faker.datatype.number({ min: 10, max: 35 })
  c.consentedDate = DateTime.local().minus({ days }).toISODate()
  c.consentedMethod = faker.helpers.arrayElement([
    ...Array(5).fill('Website'),
    'Text message',
    'Telephone',
    'In person',
    'Paper'
  ])

  c.parentOrGuardian = c.consent.responded ? parent(faker, c.lastName) : {}
  return c
}
