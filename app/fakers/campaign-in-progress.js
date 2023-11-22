import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { CONSENT_OUTCOME, PATIENT_OUTCOME, RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'
import getCampaign from './campaign.js'
import getResponse from './response.js'
import getUser from './user.js'

const setConsentOutcome = (patient, type) => {
  // Chase 80% of responses
  const chasedConsent = faker.helpers.maybe(() => true, { probability: 0.8 })

  if (patient.responses.length === 0) {
    // Get new given response
    const givenResponse = getResponse(type, patient, RESPONSE_CONSENT.GIVEN)

    // Get consent
    if (chasedConsent) {
      patient.responses = faker.helpers.multiple(givenResponse, { count: 1 })
      patient.consent.outcome = CONSENT_OUTCOME.GIVEN
    }
  } else if (patient.responses.length > 0) {
    // Find refusal response
    const refusalResponse = patient.responses.find(response => {
      return response.status === RESPONSE_CONSENT.REFUSED
    })

    // Confirm refusal
    if (chasedConsent && refusalResponse) {
      refusalResponse.status = RESPONSE_CONSENT.FINAL_REFUSAL
      refusalResponse.events.push({
        name: 'Refusal confirmed (by phone)',
        date: faker.date.recent({ days: 7 }),
        user: getUser()
      })
      patient.consent.outcome = CONSENT_OUTCOME.FINAL_REFUSAL
    }
  }

  return patient
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
