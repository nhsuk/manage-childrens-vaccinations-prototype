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

  // If event is a paper submission we won’t have a recorded time
  let date = days ? new Date() : faker.date.recent({ days })
  const [dateWithoutTime] = date.toISOString().split('T')
  date = name.includes('paper') ? dateWithoutTime : date

  return {
    name,
    date,
    user: user || getUser()
  }
}
