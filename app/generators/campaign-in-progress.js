import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { CONSENT, OUTCOME, TRIAGE, ACTION_NEEDED, ACTION_TAKEN } from '../enums.js'
import getCampaign from './campaign.js'

const setActions = (child, consent) => {
  if (consent === CONSENT.REFUSED) {
    const checkedRefusal = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (checkedRefusal) {
      child.actionTaken = ACTION_TAKEN.REFUSED_CONSENT
      child.outcome = OUTCOME.NO_CONSENT
    } else {
      child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
      child.outcome = OUTCOME.NO_OUTCOME_YET
    }
  }

  if (consent === CONSENT.UNKNOWN) {
    const attemptedToGetConsent = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (attemptedToGetConsent) {
      child.actionTaken = ACTION_TAKEN.COULD_NOT_GET_CONSENT
      child.outcome = OUTCOME.NO_CONSENT
    } else {
      child.actionNeeded = ACTION_NEEDED.GET_CONSENT
      child.outcome = OUTCOME.NO_OUTCOME_YET
    }
  }

  if (consent === CONSENT.GIVEN) {
    const couldNotVaccinate = faker.helpers.maybe(
      () => OUTCOME.COULD_NOT_VACCINATE, { probability: 0.2 }
    )

    if (couldNotVaccinate) {
      child.actionTaken = ACTION_TAKEN.COULD_NOT_VACCINATE
      child.outcome = OUTCOME.COULD_NOT_VACCINATE
    } else {
      child.actionTaken = ACTION_TAKEN.VACCINATED
      child.outcome = OUTCOME.VACCINATED
    }
  }
}

const setTriageOutcome = (child, consent) => {
  if (consent === CONSENT.GIVEN && child.needsTriage) {
    child.triageStatus = TRIAGE.READY
    child.triageCompleted = true
    child.actionNeeded = ACTION_NEEDED.VACCINATE

    // Add realistic triage note
    if (child.__triageNote) {
      child.triageNotes.push({
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
}

export default (options) => {
  const campaign = getCampaign(options)

  campaign.inProgress = true
  campaign.date = DateTime.now().toISODate() + 'T' + '09:00'

  // set triage outcomes for all children
  campaign.children.forEach(child => {
    setTriageOutcome(child, child.consent[campaign.type])
  })

  _.sampleSize(campaign.children, 50).forEach(child => {
    setActions(child, child.consent[campaign.type])
  })

  return campaign
}
