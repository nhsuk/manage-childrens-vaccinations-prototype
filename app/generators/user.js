import { fakerEN_GB as faker } from '@faker-js/faker'

/**
 * Generate user
 * @returns {object} User
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
