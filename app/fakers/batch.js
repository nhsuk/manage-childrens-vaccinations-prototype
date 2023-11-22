import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'

/**
 * @typedef {object} Batch
 * @property {string} id - ID
 * @property {number} daysUntilExpiry - First/given name
 * @property {string} expiryDate - Expiry date (ISO 8601)
 * @property {object} expiry - Expiry date (object)
 */

/**
 * Generate vaccine batch
 * @returns {Batch} Batch
 */
export default () => {
  const daysUntilExpiry = faker.number.int({ min: 10, max: 50 })
  const expiryDate = DateTime.now().plus({ days: daysUntilExpiry }).toISODate()

  const batch = {
    id: faker.helpers.replaceSymbols('??####'),
    daysUntilExpiry,
    expiryDate,
    expiry: {
      day: expiryDate.split('-')[2],
      month: expiryDate.split('-')[1],
      year: expiryDate.split('-')[0]
    }
  }

  return batch
}
