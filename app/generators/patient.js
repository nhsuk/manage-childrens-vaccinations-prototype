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

const preferredName = (patient) => {
  return `${patient.firstName} ${faker.name.lastName()}`
}

const consent = (type) => {
  switch (type) {
    case '3-in-1 and MenACWY':
      return faker.helpers.arrayElement(
        [
          { '3-in-1': true, MenACWY: true, both: true },
          { '3-in-1': false, MenACWY: true, both: false },
          { '3-in-1': true, MenACWY: false, both: false }
        ]
      )
  }

  return { [type]: true }
}

export const patient = (options) => {
  const isChild = true
  const p = person(faker, isChild)
  p.dob = faker.date.birthdate({ min: options.minAge, max: options.maxAge, mode: 'age' })
  p.age = age(p.dob)
  p.preferredName = faker.helpers.maybe(() => preferredName(p), { probability: 0.1 })
  p.yearGroup = yearGroup(p.dob)
  p.nhsNumber = faker.phone.number('##########')
  p.gp = 'Local GP'
  p.screening = 'Approved for vaccination'
  p.contraindications = false
  p.parentOrGuardian = parentOrGuardian(faker, p.lastName)
  p.consent = consent(options.type)
  p.seen = { text: 'Not yet', classes: 'nhsuk-tag--grey' }

  return p
}
