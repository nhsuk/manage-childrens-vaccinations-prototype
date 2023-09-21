import { faker } from '@faker-js/faker'
import { OUTCOME } from '../enums.js'

export default (campaigns, batches) => {
  const campaign = Object
    .values(campaigns)
    .find(campaign => campaign.inProgress)
  const { children, id } = campaign

  let batch = null
  if (campaign.isFlu) {
    batch = Object
      .values(batches)
      .find(batch => batch.isFlu)
  } else if (campaign.isHPV) {
    batch = Object
      .values(batches)
      .find(batch => batch.isHPV)
  } else if (campaign.is3in1MenACWY) {
    batch = Object
      .values(batches)
      .find(batch => batch.isMenACWY || batch.is3in1)
  }

  const vaccinationRecord = {
    [id]: {}
  }

  children
    .filter(child => child.outcome === OUTCOME.VACCINATED)
    .forEach(child => {
      vaccinationRecord[id][child.nhsNumber] = {
        given: 'Yes',
        where: 'Left arm',
        batch: batch.name
      }
    })

  children
    .filter(child => child.outcome === OUTCOME.COULD_NOT_VACCINATE)
    .forEach(child => {
      const reasons = [
        `${child.fullName} was not well enough`,
        `${child.fullName} refused it`,
        `${child.fullName} has already had the vaccine`,
        `${child.fullName} had contraindications`
      ]

      vaccinationRecord[id][child.nhsNumber] = {
        given: 'No',
        'why-not-given': faker.helpers.arrayElement(reasons)
      }
    })

  return vaccinationRecord
}
