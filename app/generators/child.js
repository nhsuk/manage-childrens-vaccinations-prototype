import person from './person.js'
import parent from './parent.js'
import address from './address.js'
import consent from './consent.js'
import triageStatus from './triage-status.js'
import gp from './gp.js'
import healthQuestions from './health-questions.js'
import { dateOfBirth, yearGroup, age } from './age.js'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import { OUTCOME, CONSENT, ACTION_NEEDED } from '../enums.js'
faker.locale = 'en_GB'

const preferredName = (child) => {
  return `${child.firstName} ${faker.name.lastName()}`
}

const setActions = (child, consent) => {
  if (consent === CONSENT.REFUSED) {
    child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
  } else if (consent === CONSENT.UNKNOWN) {
    child.actionNeeded = ACTION_NEEDED.GET_CONSENT
  } else if (consent === CONSENT.GIVEN) {
    child.actionNeeded = ACTION_NEEDED.TRIAGE
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
  c.parentOrGuardian = parent(faker, c.lastName)
  c.consent = consent(faker, options.type)
  c.outcome = OUTCOME.NO_OUTCOME_YET

  setActions(c, c.consent[options.type])
  c.actionTaken = null

  c.seen = {}
  c.triageStatus = triageStatus(options.triageInProgress, c.consent)
  c.healthQuestions = healthQuestions(faker, options.type, c.consent, c.triageStatus)

  const days = faker.datatype.number({ min: 10, max: 35 })
  c.consentedDate = DateTime.local().minus({ days }).toISODate()
  c.consentedMethod = faker.helpers.arrayElement([
    ...Array(5).fill('Website'),
    'Text message',
    'Telephone',
    'In person',
    'Paper'
  ])

  return c
}
