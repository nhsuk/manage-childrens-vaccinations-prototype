import { faker } from '@faker-js/faker'
import getUser from './user.js'

/**
 * @typedef {object} Note
 * @property {string} note - Note text
 * @property {string} date - Date note created (ISO 8601)
 * @property {object} user - User who created note
 */

/**
 * Generate note
 * @param {string} note - Note text
 * @param {object} [user] - Note taker
 * @param {boolean} [createdNow] - Use current datetime
 * @returns {Note} Note
 */
export default (note, user, createdNow) => {
  return {
    note,
    date: createdNow ? new Date() : faker.date.recent({ days: 30 }),
    user: user || getUser()
  }
}
