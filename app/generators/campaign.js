import { school } from './school.js'
import { patients } from './patients.js'
import { vaccines } from './vaccines.js'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
faker.locale = 'en_GB'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

const yearGroups = (type) => {
  switch (type) {
    case 'Flu':
      return [
        'Reception',
        'Year 1',
        'Year 2',
        'Year 3',
        'Year 4',
        'Year 5',
        'Year 6'
      ]
    case 'HPV':
      return [
        'Year 8',
        'Year 9'
      ]
  }
}

export const campaign = (options) => {
  const type = faker.helpers.arrayElement(['Flu', 'HPV'])
  const vaccinesObject = vaccines(faker, type)
  const schoolObject = school(faker, type)
  const atTime = faker.helpers.arrayElement(['09:00', '10:00', '11:00', '12:30', '13:00', '14:00'])
  const daysUntil = faker.datatype.number({ min: 2, max: 100 })
  const ageRange = type === 'Flu' ? { minAge: 4, maxAge: 11 } : { minAge: 12, maxAge: 14 }

  return {
    id: generateRandomString(3),
    title: `${type} campaign at ${schoolObject.name}`,
    location: schoolObject.name,
    date: DateTime.now().plus({ days: daysUntil }).toISODate() + 'T' + atTime,
    type,
    yearGroups: yearGroups(type),
    vaccines: vaccinesObject,
    school: schoolObject,
    patients: patients({ count: 100, patient: ageRange })
  }
}
