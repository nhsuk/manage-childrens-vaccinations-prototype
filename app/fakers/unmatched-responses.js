import _ from 'lodash'
import { fakerEN_GB as faker } from '@faker-js/faker'
import getResponse from './response.js'

/**
 * Generate unmatched responses
 * @param {Array} cohort - Session cohort
 * @param {string} type - Campaign type
 */
export default (cohort, type) => {
  let responses = []

  // Randomly generate a range of integers between 0 and 99
  const ids = faker.helpers.arrayElements(_.range(99), { min: 1, max: 10 })

  // Create unmatched responses based on patients in cohort
  for (const id of ids) {
    const patient = cohort[id]
    const response = faker.helpers.multiple(
      getResponse(type, { patient, unmatched: true }), { count: 1 }
    )
    responses = [...responses, ...response]
  }

  return responses
}
