import { person } from './person.js'
import { parentOrGuardian } from './parentOrGuardian.js'
import { faker } from '@faker-js/faker'
faker.locale = 'en_GB'

const age = (dob) => {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const yearGroup = (dob) => {
  // TODO
}

const preferredName = (child) => {
  return `${child.firstName} ${faker.name.lastName()}`
}

const consent = (type) => {
  switch (type) {
    case '3-in-1 and MenACWY':
      return faker.helpers.arrayElement(
        [
          { '3-in-1': true, 'men-acwy': true, both: true },
          { '3-in-1': false, 'men-acwy': true, both: false },
          { '3-in-1': true, 'men-acwy': false, both: false }
        ]
      )
  }

  return { [type]: true }
}

export const child = (options) => {
  const isChild = true
  const c = person(faker, isChild)
  c.dob = faker.date.birthdate({ min: options.minAge, max: options.maxAge, mode: 'age' })
  c.age = age(c.dob)
  c.preferredName = faker.helpers.maybe(() => preferredName(c), { probability: 0.1 })
  c.yearGroup = yearGroup(c.dob)
  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  c.nhsNumber = faker.phone.number('999 ### ####')
  c.gp = 'Local GP'
  c.screening = 'Approved for vaccination'
  c.contraindications = false
  c.parentOrGuardian = parentOrGuardian(faker, c.lastName)
  c.consent = consent(options.type)
  c.seen = { text: 'Not yet', classes: 'nhsuk-tag--grey' }

  return c
}
