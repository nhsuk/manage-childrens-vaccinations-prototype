import { TRIAGE } from '../enums.js'

export default (campaigns) => {
  const triageRecord = {}
  // get all campaigns in progress or triageInProgress
  const inProgressCampaigns = Object.values(campaigns).filter(campaign => campaign.inProgress || campaign.triageInProgress)
  const triageStatusToEnrich = [
    TRIAGE.READY,
    TRIAGE.DO_NOT_VACCINATE,
    TRIAGE.REFUSED_CONSENT,
    TRIAGE.NEEDS_FOLLOW_UP
  ]

  inProgressCampaigns.forEach(campaign => {
    const campaignId = campaign.id
    const children = campaign.children
    triageRecord[campaignId] = {}

    children.filter(c => triageStatusToEnrich.includes(c.triageStatus)).forEach(child => {
      triageRecord[campaignId][child.nhsNumber] = {
        notes: child.triageNotes,
        status: child.triageStatus
      }
    })
  })

  return triageRecord
}
