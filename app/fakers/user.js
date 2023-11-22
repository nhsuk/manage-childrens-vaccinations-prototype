import { fakerEN_GB as faker } from '@faker-js/faker'

/**
 * @typedef {object} User
 * @property {string} id - UUID
 * @property {string} firstName - First/given name
 * @property {string} lastName - Last/family name
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 */

/**
 * Generate user
 * @returns {User} User
 */
export default () => {
  const firstName = faker.person.lastName()
  const lastName = faker.person.lastName()

  const user = {
    id: faker.string.uuid(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({
      firstName,
      lastName,
      provider: 'sais.nhs.uk'
    }).replaceAll('_', '.').toLowerCase()
  }

  return user
}
