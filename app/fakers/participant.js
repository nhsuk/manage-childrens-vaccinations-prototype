import { fakerEN_GB as faker } from '@faker-js/faker'
import getParent from './parent.js'

/**
 * @typedef {object} Participant
 * @property {string} id - UUID
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 * @property {string} tel - Phone number
 */

/**
 * Generate pilot participant
 * @returns {Participant} Participant
 */
export default () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.firstName()

  const participant = {
    id: faker.string.uuid(),
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    tel: faker.helpers.replaceSymbolWithNumber('07### ######')
  }

  return participant
}
