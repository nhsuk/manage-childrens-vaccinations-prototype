import { faker } from '@faker-js/faker'
import { TRIAGE } from '../enums.js'

export default (triageInProgress) => {
  if (triageInProgress) {
    return faker.helpers.arrayElement([
      ...Array(10).fill(TRIAGE.TO_DO),
      ...Array(10).fill(TRIAGE.READY),
      TRIAGE.NEEDS_FOLLOW_UP
    ])
  } else {
    return TRIAGE.TO_DO
  }
}
