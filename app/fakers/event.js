import { faker } from '@faker-js/faker'
import getUser from './user.js'

/**
 * @typedef {object} Event
 * @property {string} name - Event text
 * @property {string} date - Date note created (ISO 8601)
 * @property {object} user - User who created note
 */

/**
 * Generate event
 * @param {string} name - Event text
 * @param {object} [user] - Event initiator
 * @param {number} [days] - Number of days in the past for faked date
 * @returns {Event} Event
 */
export default (name, options = {}) => {
  const { user, days } = options

  return {
    name,
    date: days ? new Date() : faker.date.recent({ days }),
    user: user || getUser()
  }
}
