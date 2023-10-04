import { fakerEN_GB as faker } from '@faker-js/faker'
import getChildFirstName from './child-first-name.js'
import getGpSurgery from './gp-surgery.js'
import { yearGroups } from './year-group.js'

/**
 * Generate child
 * @param {number} minYearGroup - Minimum year group
 * @param {number} maxYearGroup - Maximum year group
 * @returns {object} Child
 */
export default (minYearGroup, maxYearGroup) => {
  const sex = faker.helpers.arrayElement(['Male', 'Female'])
  const firstName = getChildFirstName(faker, sex)
  const lastName = faker.person.lastName()
  const knownAs = `${firstName} ${faker.person.lastName()}`

  // Only generate dates of birth applicable to campaign vaccine
  const dob = faker.date.between({
    from: yearGroups()[maxYearGroup].start,
    to: yearGroups()[minYearGroup].end
  })

  const child = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    knownAs: faker.helpers.maybe(() => knownAs, { probability: 0.1 }),
    sex,
    dob,
    gpSurgery: getGpSurgery()
  }

  return child
}
