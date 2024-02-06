import { fakerEN_GB as faker } from '@faker-js/faker'
import { CONTACT_PREFERENCE, PARENTAL_RELATIONSHIP } from '../enums.js'

/**
 * @typedef {object} Parent
 * @property {string} firstName - First/given name
 * @property {string} lastName - Last/family name
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 * @property {string} [tel] - Telephone number
 * @property {string} [contactPreference] - Contact preference
 * @property {string} [contactPreferenceOther] - Contact preference details
 * @property {string} relationship - Relationship to child
 * @property {string} [relationshipOther] - Relationship to child details
 */

/**
 * Generate parent
 * @param {object} patient - Patient
 * @returns {Parent} Parent
 */
export default (patient) => {
  const { MUM, DAD, GUARDIAN, CARER, STEP_PARENT, GRANDPARENT, OTHER } = PARENTAL_RELATIONSHIP

  const relationship = faker.helpers.weightedArrayElement([
    { value: MUM, weight: 8 },
    { value: DAD, weight: 8 },
    { value: GUARDIAN, weight: 3 },
    { value: CARER, weight: 2 },
    { value: STEP_PARENT, weight: 1 },
    { value: GRANDPARENT, weight: 1 },
    { value: OTHER, weight: 1 }
  ])

  const contactPreference = faker.helpers.arrayElement(
    Object.values(CONTACT_PREFERENCE)
  )

  let firstName
  switch (relationship) {
    case MUM:
      firstName = faker.person.firstName('female')
      break
    case DAD:
      firstName = faker.person.firstName('male')
      break
    default:
      firstName = faker.person.firstName()
  }

  // 3 out of 4 parents have same surname as patient
  // Do not match name if guardian or carer
  const lastName = relationship === (MUM || DAD)
    ? faker.helpers.weightedArrayElement([
      { value: patient.lastName, weight: 3 },
      { value: faker.person.lastName(), weight: 1 }
    ])
    : faker.person.lastName()

  const phone = '07### ######'.replace(/#+/g, (m) =>
    faker.string.numeric(m.length)
  )
  const tel = faker.helpers.maybe(() => phone, { probability: 0.7 })

  const parent = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    ...tel && {
      tel,
      contactPreference
    },
    ...(tel && contactPreference === OTHER) && {
      contactPreferenceOther: 'Can only be reached by text from 6am - 3pm'
    },
    relationship,
    ...(relationship === OTHER) && {
      relationshipOther: 'Foster parent'
    }
  }

  return parent
}
