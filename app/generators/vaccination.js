import { faker } from '@faker-js/faker'
import { PATIENT_OUTCOME, VACCINATION_OUTCOME, VACCINATION_SITE } from '../enums.js'

/**
 * Get vaccination
 * @param {Array} campaigns - Campaigns
 * @param {Array} batches - Vaccine batches
 * @returns {object} Vaccination
 */
export default (campaigns, batches) => {
  const inProgressCampaign = Object
    .values(campaigns)
    .find(campaign => campaign.inProgress)

  if (!inProgressCampaign) {
    return
  }

  const { cohort, id } = inProgressCampaign

  let batch = null
  if (inProgressCampaign.isFlu) {
    batch = Object
      .values(batches)
      .find(batch => batch.isFlu)
  } else if (inProgressCampaign.isHPV) {
    batch = Object
      .values(batches)
      .find(batch => batch.isHPV)
  } else if (inProgressCampaign.is3in1MenACWY) {
    batch = Object
      .values(batches)
      .find(batch => batch.isMenACWY || batch.is3in1)
  }

  const vaccination = {
    [id]: {}
  }

  cohort
    .filter(patient => patient.outcome === PATIENT_OUTCOME.VACCINATED)
    .forEach(patient => {
      vaccination[id][patient.nhsNumber] = {
        outcome: VACCINATION_OUTCOME.VACCINATED,
        site: VACCINATION_SITE.ARM_LEFT,
        batch: batch.name
      }
    })

  cohort
    .filter(patient => patient.outcome === PATIENT_OUTCOME.COULD_NOT_VACCINATE)
    .forEach(patient => {
      vaccination[id][patient.nhsNumber] = {
        outcome: faker.helpers.arrayElement([
          VACCINATION_OUTCOME.CONTRAINDICATIONS,
          VACCINATION_OUTCOME.REFUSED,
          VACCINATION_OUTCOME.ABSENT,
          VACCINATION_OUTCOME.UNWELL,
          VACCINATION_OUTCOME.NO_CONSENT,
          VACCINATION_OUTCOME.LATE_CONSENT
        ])
      }
    })

  return vaccination
}
