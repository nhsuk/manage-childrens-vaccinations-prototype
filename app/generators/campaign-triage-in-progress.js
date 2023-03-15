import campaign from './campaign.js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { CONSENT, TRIAGE } from '../enums.js'

const setTriageOutcome = (child, consent) => {
  if (consent === CONSENT.GIVEN) {
    child.triageStatus = TRIAGE.READY

    // Activate triage notes
    if (child.healthQuestions.inactiveTriage) {
      child.healthQuestions.triage = child.healthQuestions.inactiveTriage
      delete child.healthQuestions.inactiveTriage
    }
  }
}

export default (options) => {
  const c = campaign(options)
  c.triageInProgress = true

  // set a date that is next Monday
  const today = DateTime.now()
  const nextMonday = today.plus({ days: 7 - today.weekday + 1 })
  c.date = nextMonday.toISODate() + 'T' + '09:00'

  _.sampleSize(c.children, 50).forEach(child => {
    setTriageOutcome(child, child.consent[c.type])
  })

  return c
}
