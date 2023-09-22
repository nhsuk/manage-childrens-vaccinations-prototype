import { TRIAGE_REASON, ACTION_NEEDED } from '../enums.js'

export default (child) => {
  const triageReasons = []
  child.needsTriage = false

  // No responses
  if (!child.consent.responses) {
    return
  }

  if (child.consent.answersNeedTriage) {
    child.needsTriage = true
    child.actionNeeded = ACTION_NEEDED.TRIAGE
    triageReasons.push(TRIAGE_REASON.HAS_NOTES)
  }

  if (child.consent.unknown) {
    child.needsTriage = true
    child.actionNeeded = ACTION_NEEDED.TRIAGE
    triageReasons.push(TRIAGE_REASON.INCONSISTENT_CONSENT)
  }

  child.triageReasons = triageReasons
}
