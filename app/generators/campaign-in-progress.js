import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { CONSENT_OUTCOME, TRIAGE_OUTCOME, PATIENT_OUTCOME } from '../enums.js'
import getCampaign from './campaign.js'
import getNote from './note.js'

const setConsentOutcome = (patient) => {
  // 20% of refusals chased, and all confirmed their refusal
  if (patient.consent.outcome === CONSENT_OUTCOME.REFUSED) {
    const checkedRefusal = faker.helpers.maybe(
      () => true, { probability: 0.2 }
    )

    if (checkedRefusal) {
      const contact = patient.responses[0].parentOrGuardian.relationship
      patient.consent.outcome = CONSENT_OUTCOME.FINAL_REFUSAL
      patient.outcome = PATIENT_OUTCOME.NO_CONSENT
      patient.consent.notes.push(getNote(`Spoke to ${contact.toLowerCase()} who confirmed decision.`))
    }
  }
}

const setTriageOutcome = (patient) => {
  // Only relevant to patients needing triage
  if (patient.triage.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE) {
    return
  }

  patient.triage.outcome = TRIAGE_OUTCOME.VACCINATE

  // Add realistic triage note
  if (patient.__triageNote) {
    patient.triage.notes.push(getNote(patient.__triageNote))

    delete patient.__triageNote
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

export default () => {
  const campaign = getCampaign()

  campaign.inProgress = true
  campaign.date = DateTime.now().toISODate() + 'T' + '09:00'

  // Set consent outcome for all patients
  campaign.cohort.forEach(patient => setConsentOutcome(patient))

  // Set triage outcome for all patients
  campaign.cohort.forEach(patient => setTriageOutcome(patient))

  // Set patient outcome for 50% of patients
  _.sampleSize(campaign.cohort, 50).forEach(patient => setOutcome(patient))

  return campaign
}
