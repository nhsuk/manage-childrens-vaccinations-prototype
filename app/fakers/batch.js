import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'

/**
 * @typedef {object} Batch
 * @property {string} id - ID
 * @property {string} enteredDate - Entered date (ISO 8601)
 * @property {string} expiryDate - Expiry date (ISO 8601)
 * @property {object} expiry - Expiry date (object)
 */

/**
 * Generate vaccine batch
 * @returns {Batch} Batch
 */
export default () => {
  const enteredDate = faker.date.recent({ days: 70 })
  const expiryDate = faker.date.recent({ days: 50 })

  const batch = {
    id: faker.helpers.replaceSymbols('??####'),
    enteredDate,
    expiryDate,
    expiry: {
      day: DateTime.fromJSDate(expiryDate).toFormat('dd'),
      month: DateTime.fromJSDate(expiryDate).toFormat('MM'),
      year: DateTime.fromJSDate(expiryDate).toFormat('yyyy')
    }
  }

  return batch
}
