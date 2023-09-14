import { TRIAGE_REASON, ACTION_NEEDED } from '../enums.js'

export default (faker, child) => {
  const reasons = []
  child.needsTriage = false
  if (!child.consent.consented) return

  if (child.healthQuestions.hasAnswers) {
    child.needsTriage = true
    child.actionNeeded = ACTION_NEEDED.TRIAGE
    reasons.push(TRIAGE_REASON.HAS_NOTES)
  }

  if (faker.helpers.maybe(() => true, { probability: 0.1 })) {
    child.needsTriage = true
    child.actionNeeded = ACTION_NEEDED.TRIAGE
    reasons.push(TRIAGE_REASON.INCONSISTENT_CONSENT)
  }

  child.triageReasons = reasons
}
