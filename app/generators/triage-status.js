import { TRIAGE } from '../enums.js'

export default (consent) => {
  if (consent.consented) {
    return TRIAGE.TO_DO
  }

  if (consent.refused) {
    return TRIAGE.REFUSED_CONSENT
  }

  return TRIAGE.NO_CONSENT_RESPONSE
}
