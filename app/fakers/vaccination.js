import { faker } from '@faker-js/faker'
import { PATIENT_OUTCOME, VACCINATION_OUTCOME, VACCINATION_SITE } from '../enums.js'

/**
 * Get vaccination
 * @param {Array} sessions - Sessions
 * @param {Array} batches - Vaccine batches
 * @returns {object} Vaccination
 */
export default (sessions, batches) => {
  const inProgressSession = Object
    .values(sessions)
    .find(session => session.inProgress)

  if (!inProgressSession) {
    return
  }

  const { cohort, id } = inProgressSession

  let batch = null
  if (inProgressSession.isFlu) {
    batch = Object
      .values(batches)
      .find(batch => batch.isFlu)
  } else if (inProgressSession.isHPV) {
    batch = Object
      .values(batches)
      .find(batch => batch.isHPV)
  } else if (inProgressSession.is3in1MenACWY) {
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
