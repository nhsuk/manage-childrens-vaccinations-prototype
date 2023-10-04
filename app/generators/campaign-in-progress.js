import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { PATIENT_OUTCOME, TRIAGE_OUTCOME, ACTION_NEEDED, CONSENT_OUTCOME } from '../enums.js'
import getCampaign from './campaign.js'

const setActions = (child) => {
  if (child.consent.outcome === CONSENT_OUTCOME.REFUSED) {
    const checkedRefusal = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (checkedRefusal) {
      child.outcome = PATIENT_OUTCOME.NO_CONSENT
    } else {
      child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
    }
  }

  if (child.consent.outcome === CONSENT_OUTCOME.INCONSISTENT) {
    child.actionNeeded = ACTION_NEEDED.CHECK_CONFLICTING
  }

  if (child.consent.outcome === CONSENT_OUTCOME.NO_RESPONSE) {
    const attemptedToGetConsent = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (attemptedToGetConsent) {
      child.outcome = PATIENT_OUTCOME.NO_CONSENT
    } else {
      child.actionNeeded = ACTION_NEEDED.GET_CONSENT
    }
  }

  if (child.consent.outcome === CONSENT_OUTCOME.VALID) {
    const couldNotVaccinate = faker.helpers.maybe(
      () => PATIENT_OUTCOME.COULD_NOT_VACCINATE, { probability: 0.2 }
    )

    if (couldNotVaccinate) {
      child.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
    } else {
      child.outcome = PATIENT_OUTCOME.VACCINATED
    }
  }
}

const setTriageOutcome = (child) => {
  // Only relevant to children needing triage
  if (
    !child.consent.outcome === CONSENT_OUTCOME.VALID &&
    !child.triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE
  ) {
    return
  }

  child.triage.outcome = TRIAGE_OUTCOME.VACCINATE

  // Add realistic triage note
  if (child.__triageNote) {
    child.triage.notes.push({
      date: faker.date.recent({ days: 30 }),
      note: child.__triageNote,
      user: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com'
      }
    })

    delete child.__triageNote
  }
}

export default (options) => {
  const campaign = getCampaign(options)

  campaign.inProgress = true
  campaign.date = DateTime.now().toISODate() + 'T' + '09:00'

  // set triage outcomes for all children
  campaign.children.forEach(child => {
    setTriageOutcome(child)
  })

  _.sampleSize(campaign.children, 50).forEach(child => {
    setActions(child)
  })

  return campaign
}
