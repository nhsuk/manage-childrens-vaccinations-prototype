import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import getChildFirstName from './child-first-name.js'
import getGpSurgery from './gp-surgery.js'
import { yearGroups } from './year-group.js'

/**
 * @typedef {object} Child
 * @property {string} firstName - First/given name
 * @property {string} lastName - Last/family name
 * @property {string} fullName - Full name
 * @property {string} knownAs - Name also known by
 * @property {string} sex - Sex
 * @property {string} dob - Date of birth (ISO 8601)
 * @property {string} gpSurgery - GP surgery
 */

/**
 * Generate child
 * @param {number} minYearGroup - Minimum year group
 * @param {number} maxYearGroup - Maximum year group
 * @returns {Child} Child
 */
export default (minYearGroup, maxYearGroup) => {
  const sex = faker.helpers.arrayElement(['Male', 'Female'])
  const firstName = getChildFirstName(faker, sex)
  const lastName = faker.person.lastName()
  const knownAs = `${firstName} ${faker.person.lastName()}`

  // Only generate dates of birth applicable to vaccine
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
    dob: DateTime.fromJSDate(dob).toISODate(),
    gpSurgery: getGpSurgery()
  }

  return child
}
