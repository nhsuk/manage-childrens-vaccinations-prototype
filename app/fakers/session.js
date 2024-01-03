import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import { yearGroups } from '../utils/campaign.js'
import { generateRandomString } from '../utils/string.js'
import getSchool from './school.js'
import getPatient from './patient.js'
import getUnmatchedResponses from './unmatched-responses.js'

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

/**
 * Generate session
 * @param {string} type - Session type
 */
export default (type) => {
  // Exclude 3-in-1 and MenACWY for now, as the design is not ready
  type = type || faker.helpers.arrayElement(['HPV', 'Flu'])

  const school = getSchool(type)
  const atTime = faker.helpers.arrayElement(['09:00', '10:00', '11:00', '12:30', '13:00', '14:00'])
  const daysUntil = faker.number.int({ min: 2, max: 100 })
  const options = { ...ageRange(type) }
  const cohort = faker.helpers.multiple(getPatient(options), { count: 100 })
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
  const unmatchedResponses = getUnmatchedResponses(cohort, type)

  const session = {
    id: generateRandomString(3),
    title: `${type} session at ${school.name}`,
    location: school.name,
    date: DateTime.now().plus({ days: daysUntil }).toISODate() + 'T' + atTime,
    type,
    triageInProgress: daysUntil < 28,
    yearGroups: yearGroups(type),
    school,
    isFlu: type === 'Flu',
    isHPV: type === 'HPV',
    is3in1MenACWY: type === '3-in-1 and MenACWY',
    cohort,
    unmatchedResponses
  }

  return session
}
