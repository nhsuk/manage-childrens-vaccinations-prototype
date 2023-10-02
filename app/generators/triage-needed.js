import { ACTION_NEEDED } from '../enums.js'

export default (child) => {
  child.needsTriage = false

  // No responses
  if (!child.consent.responses) {
    return
  }

  // Answered yes to health questions
  if (child.consent.answersNeedTriage) {
    child.needsTriage = true
    child.actionNeeded = ACTION_NEEDED.TRIAGE
  }
}
