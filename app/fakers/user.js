import { fakerEN_GB as faker } from '@faker-js/faker'

/**
 * @typedef {object} User
 * @property {string} id - UUID
 * @property {string} firstName - First/given name
 * @property {string} lastName - Last/family name
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 * @property {string} registrationBody - Professional body
 * @property {string} registration - Registration number
 */

const regulators = {
  // https://www.gmc-uk.org/registration-and-licensing/the-medical-register
  gmc: {
    name: 'General Medical Council',
    registrationFormat: '#######'
  },
  // https://www.pharmacyregulation.org/registers
  gphc: {
    name: 'General Pharmaceutical Council',
    registrationFormat: '#######'
  },
  // https://www.hcpc-uk.org/public/be-sure-check-the-register/
  hcpc: {
    name: 'Health and Care Professions Council',
    registrationFormat: 'SW######' // Social worker
  },
  // https://www.nmc.org.uk/globalassets/sitedocuments/registration/application-for-transferring-from-the-temporary-register-to-the-permanen....pdf
  nmc: {
    name: 'Nursing and Midwifery Council',
    registrationFormat: '##?####?'
  }
}

/**
 * Generate user
 * @returns {User} User
 */
export default () => {
  const firstName = faker.person.lastName()
  const lastName = faker.person.lastName()

  // 'gmc', 'gphc', 'hcpc' or 'nmc'
  const registrationBody = faker.helpers.weightedArrayElement(
    [
      { weight: 3, value: 'gmc' },
      { weight: 1, value: 'gphc' },
      { weight: 5, value: 'nmc' },
      { weight: 1, value: 'hcpc' }
    ]
  )

  const registration = faker.helpers.replaceSymbols(
    regulators[registrationBody].registrationFormat
  )

  const user = {
    id: faker.string.uuid(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({
      firstName,
      lastName,
      provider: 'sais.nhs.uk'
    }).replaceAll('_', '.').toLowerCase(),
    registrationBody,
    registration
  }

  return user
}
