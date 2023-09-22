import { faker } from '@faker-js/faker'
import { CONSENT } from '../enums.js'

export default (type) => {
  const consent = faker.helpers.arrayElement([
    ...Array(10).fill(CONSENT.GIVEN),
    ...Array(5).fill(CONSENT.UNKNOWN),
    CONSENT.REFUSED
  ])

  return {
    [type]: consent,
    text: consent,
    refused: consent === CONSENT.REFUSED,
    consented: consent === CONSENT.GIVEN,
    responded: consent !== CONSENT.UNKNOWN
  }
}
