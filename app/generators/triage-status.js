import { TRIAGE } from '../enums.js'

export default (consented) => {
  if (!consented) {
    return TRIAGE.CANNOT_TRIAGE_YET
  }
  return TRIAGE.TO_DO
}
