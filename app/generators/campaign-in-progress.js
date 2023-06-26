import campaign from './campaign.js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'
import { CONSENT, OUTCOME, TRIAGE, ACTION_NEEDED, ACTION_TAKEN } from '../enums.js'

const setActions = (child, consent) => {
  if (consent === CONSENT.REFUSED) {
    child.outcome = OUTCOME.NO_CONSENT
    child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
  }

  if (consent === CONSENT.UNKNOWN) {
    child.outcome = OUTCOME.NO_CONSENT
    child.actionNeeded = ACTION_NEEDED.GET_CONSENT
  }

  if (consent === CONSENT.REFUSED || consent === CONSENT.UNKNOWN) {
    child.outcome = OUTCOME.NO_CONSENT
    child.actionNeeded = ACTION_NEEDED.GET_CONSENT
  }

  if (consent === CONSENT.GIVEN) {
    const couldNotVaccinate = faker.helpers.maybe(() => OUTCOME.COULD_NOT_VACCINATE, { probability: 0.2 })
    child.outcome = couldNotVaccinate || OUTCOME.VACCINATED
    child.actionTaken = couldNotVaccinate ? ACTION_TAKEN.COULD_NOT_VACCINATE : ACTION_TAKEN.VACCINATED
  }
}

const setTriageOutcome = (child, consent) => {
  if (consent === CONSENT.GIVEN) {
    child.triageStatus = TRIAGE.READY
    child.actionNeeded = ACTION_NEEDED.VACCINATE

    // Activate triage notes
    if (child.healthQuestions.inactiveTriage) {
      child.healthQuestions.triage = child.healthQuestions.inactiveTriage
      delete child.healthQuestions.inactiveTriage
    }
  }
}

export default (options) => {
  const c = campaign(options)

  c.inProgress = true
  c.date = DateTime.now().toISODate() + 'T' + '09:00'

  // set triage outcomes for all children
  c.children.forEach(child => {
    setTriageOutcome(child, child.consent[c.type])
  })

  _.sampleSize(c.children, 50).forEach(child => {
    setActions(child, child.consent[c.type])
  })

  return c
}
