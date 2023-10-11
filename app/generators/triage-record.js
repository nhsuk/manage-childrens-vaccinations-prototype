import { TRIAGE_OUTCOME } from '../enums.js'

export default (campaigns) => {
  const triageRecord = {}
  // get all campaigns in progress or triageInProgress
  const inProgressCampaigns = Object.values(campaigns).filter(campaign => campaign.inProgress || campaign.triageInProgress)
  const triageOutcomeToEnrich = [
    TRIAGE_OUTCOME.VACCINATE,
    TRIAGE_OUTCOME.DELAY_VACCINATION,
    TRIAGE_OUTCOME.DO_NOT_VACCINATE
  ]

  inProgressCampaigns.forEach(campaign => {
    triageRecord[campaign.id] = {}

    campaign.children
      .filter(patient => triageOutcomeToEnrich.includes(patient.triage.outcome))
      .forEach(patient => {
        triageRecord[campaign.id][patient.nhsNumber] = patient.triage
      })
  })

  return triageRecord
}
