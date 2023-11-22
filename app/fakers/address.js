import { fakerEN_GB as faker } from '@faker-js/faker'

/**
 * Generate address
 * @returns {string} Address
 */
export default () => {
  const postcodeOutward = `BS${faker.number.int({ min: 1, max: 9 })}`
  const postcodeInward = faker.location.zipCode().split(' ')[1]

  const address = [
    faker.location.streetAddress(),
    'Bristol',
    `${postcodeOutward} ${postcodeInward}`
  ].join('\n')

  return address
}
