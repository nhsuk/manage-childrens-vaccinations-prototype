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
faker.locale = 'en_GB'

const preferredName = (child) => {
  return `${child.firstName} ${faker.name.lastName()}`
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
  c.outcome = 'No outcome yet'
  c.seen = {}
  c.healthQuestions = healthQuestions(faker, options.type)
  c.triageStatus = triageStatus(c.consent.consented)

  const days = faker.datatype.number({ min: 10, max: 35 })
  c.consentedDate = DateTime.local().minus({ days }).toISODate()
  c.consentedMethod = faker.helpers.arrayElement(['Website', 'Website', 'Website', 'Website', 'Website', 'Text message', 'Telephone', 'In person', 'Paper'])

  return c
}
