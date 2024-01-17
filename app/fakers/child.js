import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import getAddress from './address.js'
import getChildFirstName from './child-first-name.js'
import getGpSurgery from './gp-surgery.js'
import { yearGroups } from './year-group.js'

/**
 * @typedef {object} Child
 * @property {string} firstName - First/given name
 * @property {string} lastName - Last/family name
 * @property {string} fullName - Full name
 * @property {string} [knownAs] - Name also known by
 * @property {string} sex - Sex
 * @property {string} dob - Date of birth (ISO 8601)
 * @property {object} address - Address
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
  const knownAs = faker.helpers.maybe(
    () => `${firstName} ${faker.person.lastName()}`,
    { probability: 0.1 }
  )

  // Only generate dates of birth applicable to vaccine
  const dob = faker.date.between({
    from: yearGroups()[maxYearGroup].start,
    to: yearGroups()[minYearGroup].end
  })

  const address = getAddress();

  const child = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    ...knownAs && { knownAs },
    sex,
    dob: DateTime.fromJSDate(dob).toISODate(),
    address,
    postcode: address.split('\n')[2],
    gpSurgery: getGpSurgery()
  }

  return child
}
