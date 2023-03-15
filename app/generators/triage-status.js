import { TRIAGE } from '../enums.js'
import { faker } from '@faker-js/faker'

export default (triageInProgess, consent) => {
  if (consent.consented) {
    if (triageInProgess) {
      return faker.helpers.arrayElement([
        ...Array(10).fill(TRIAGE.TO_DO),
        ...Array(10).fill(TRIAGE.READY),
        TRIAGE.NEEDS_FOLLOW_UP,
        TRIAGE.DO_NOT_VACCINATE
      ])
    } else {
      return TRIAGE.TO_DO
    }
  }

  if (consent.refused) {
    return TRIAGE.REFUSED_CONSENT
  }

  return TRIAGE.NO_CONSENT_RESPONSE
}
