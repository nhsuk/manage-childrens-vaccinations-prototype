import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { CONSENT_OUTCOME, PATIENT_OUTCOME, RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'
import getCampaign from './campaign.js'
import getResponse from './response.js'
import getUser from './user.js'

const setConsentOutcome = (patient, type) => {
  const chasedConsent = faker.helpers.maybe(() => true, { probability: 0.8 })

  if (patient.responses.length === 0) {
    // Chase a single response and get consent
    patient.responses = faker.helpers.multiple(getResponse(type, patient), {
      count: 1
    })
    patient.consent.outcome = CONSENT_OUTCOME.GIVEN
  } else {
    // Chase 80% of refusals and have them confirmed
    for (const response of patient.responses) {
      if (chasedConsent && response.status === RESPONSE_CONSENT.REFUSED) {
        response.status = RESPONSE_CONSENT.FINAL_REFUSAL
        response.events.push({
          name: 'Refusal confirmed (by phone)',
          date: faker.date.recent({ days: 7 }),
          user: getUser()
        })
      }
    }
    patient.consent.outcome = CONSENT_OUTCOME.FINAL_REFUSAL
  }
}

const setOutcome = (patient) => {
  // 20% of patients could not be vaccinated
  if (
    patient.consent.outcome === CONSENT_OUTCOME.GIVEN &&
    patient.triage.outcome === TRIAGE_OUTCOME.VACCINATE
  ) {
    const couldNotVaccinate = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (couldNotVaccinate) {
      patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
    } else {
      patient.outcome = PATIENT_OUTCOME.VACCINATED
    }
  }
}

/**
 * Generate in progress campaign
 * @param {string} type - Campaign type
 */
export default (type) => {
  const campaign = getCampaign(type)

  campaign.inProgress = true
  campaign.date = DateTime.now().toISODate() + 'T' + '09:00'

  // Set consent outcome for all patients
  campaign.cohort.forEach(patient => setConsentOutcome(patient, type))

  // Set patient outcome for 50% of patients
  _.sampleSize(campaign.cohort, 50).forEach(patient => setOutcome(patient))

  return campaign
}
