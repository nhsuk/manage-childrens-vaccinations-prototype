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
    const campaignId = campaign.id
    const children = campaign.children
    triageRecord[campaignId] = {}

    children.filter(c => triageOutcomeToEnrich.includes(c.triage.outcome)).forEach(child => {
      triageRecord[campaignId][child.nhsNumber] = child.triage
    })
  })

  return triageRecord
}
