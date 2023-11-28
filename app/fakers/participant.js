import { fakerEN_GB as faker } from '@faker-js/faker'
import getAddress from './address.js'
import getChild from './child.js'
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
  const nhsNumber = faker.helpers.replaceSymbolWithNumber('999#######')

  const child = getChild(5, 10)
  child.address = getAddress()
  child.nhsNumber = faker.helpers.maybe(() => nhsNumber, { probability: 0.7 })
  child.urn = faker.helpers.replaceSymbolWithNumber('1####')

  const parent = getParent(child)

  const participant = {
    id: faker.string.uuid(),
    parent,
    child
  }

  return participant
}
