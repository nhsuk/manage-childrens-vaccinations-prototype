import { faker } from '@faker-js/faker'
import { CONSENT } from '../enums.js'

export default (type) => {
  let consent = faker.helpers.arrayElement([
    ...Array(10).fill(CONSENT.GIVEN),
    CONSENT.REFUSED
  ])

  if (type === '3-in-1 and MenACWY') {
    consent = faker.helpers.arrayElement([
      ...Array(5).fill(CONSENT.GIVEN),
      ...Array(5).fill(CONSENT.ONLY_MENACWY),
      ...Array(5).fill(CONSENT.ONLY_3_IN_1),
      ...Array(2).fill(CONSENT.REFUSED)
    ])
  }

  return consent
}
