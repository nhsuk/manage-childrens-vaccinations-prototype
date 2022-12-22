import { school } from './school.js'
import { patients } from './patients.js'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
faker.locale = 'en_GB'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

export const campaign = (options) => {
  const type = faker.helpers.arrayElement(['Flu', 'HPV'])
  const schoolObject = school(faker)
  const atTime = faker.helpers.arrayElement(['09:00', '10:00', '11:00', '12:30', '13:00', '14:00'])
  const daysUntil = faker.datatype.number({ min: 2, max: 100 })

  return {
    id: generateRandomString(3),
    title: `${type} campaign at ${schoolObject.name}`,
    location: schoolObject.name,
    date: DateTime.now().plus({ days: daysUntil }).toISODate() + 'T' + atTime,
    type: type,
    vaccine: {
      brand: 'Fluenz Tetra',
      method: 'Nasal spray',
      batch: 'P100475581',
      summary: 'Flu (Fluenz Tetra, P100475581)'
    },
    school: schoolObject,
    patients: patients({ count: 100, patient: { minAge: 4, maxAge: 11 } })
  }
}
