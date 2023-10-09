import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import getSchool from './school.js'
import getPatient from './patient.js'
import getYearGroups from './year-groups.js'
import getHealthQuestions from './health-questions.js'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase()
}

const ageRange = (type) => {
  switch (type) {
    case 'Flu':
      return { minYearGroup: 0, maxYearGroup: 6, type }
    case 'HPV':
      return { minYearGroup: 8, maxYearGroup: 9, type }
    case '3-in-1 and MenACWY':
      return { minYearGroup: 9, maxYearGroup: 10, type }
  }
}

export default () => {
  const type = faker.helpers.arrayElement(['HPV', 'Flu']) // Exclude 3-in-1 and MenACWY for now, as the design is not ready
  const school = getSchool(type)
  const atTime = faker.helpers.arrayElement(['09:00', '10:00', '11:00', '12:30', '13:00', '14:00'])
  const daysUntil = faker.number.int({ min: 2, max: 100 })
  const triageInProgress = daysUntil < 28
  const options = { ...ageRange(type), triageInProgress }
  const children = faker.helpers.multiple(getPatient(options), { count: 100 })
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  const campaign = {
    id: generateRandomString(3),
    title: `${type} session at ${school.name}`,
    location: school.name,
    date: DateTime.now().plus({ days: daysUntil }).toISODate() + 'T' + atTime,
    type,
    healthQuestions: getHealthQuestions(type),
    triageInProgress,
    yearGroups: getYearGroups(type),
    school,
    isFlu: type === 'Flu',
    isHPV: type === 'HPV',
    is3in1MenACWY: type === '3-in-1 and MenACWY',
    children
  }

  return campaign
}
