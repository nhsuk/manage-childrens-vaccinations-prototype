import { person } from './person.js'
import { parent } from './parent.js'
import { address } from './address.js'
import { consent } from './consent.js'
import { gp } from './gp.js'
import { healthQuestions } from './health-questions.js'
import { dateOfBirth, yearGroup, age } from './age.js'
import { faker } from '@faker-js/faker'
faker.locale = 'en_GB'

const preferredName = (child) => {
  return `${child.firstName} ${faker.name.lastName()}`
}

export const child = (options) => {
  const isChild = true
  const c = person(faker, isChild)
  const dob = dateOfBirth(faker, options)

  c.preferredName = faker.helpers.maybe(() => preferredName(c), { probability: 0.1 })
  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  c.nhsNumber = faker.phone.number('999#######')
  c.address = address(faker)
  c.gp = gp(faker)
  c.dob = dob
  c.age = age(dob)
  c.yearGroup = yearGroup(dob)
  c.parentOrGuardian = parent(faker, c.lastName)
  c.consent = consent(faker, options.type)
  c.outcome = 'No outcome yet'
  c.seen = {}
  c.healthQuestions = healthQuestions(faker, options.type)

  return c
}
