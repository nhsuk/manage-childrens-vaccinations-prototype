import { TRIAGE } from '../enums.js'

export default (campaigns) => {
  const tr = {}
  // get all campaigns in progress or triageInProgress
  const inProgressCampaigns = Object.values(campaigns).filter(c => c.inProgress || c.triageInProgress)
  const triageStatusToEnrich = [
    TRIAGE.READY,
    TRIAGE.DO_NOT_VACCINATE,
    TRIAGE.REFUSED_CONSENT,
    TRIAGE.NEEDS_FOLLOW_UP
  ]

  inProgressCampaigns.forEach(campaign => {
    const campaignId = campaign.id
    const children = campaign.children
    tr[campaignId] = {}

    children.filter(c => triageStatusToEnrich.includes(c.triageStatus)).forEach(child => {
      tr[campaignId][child.nhsNumber] = {
        notes: child.healthQuestions.triage,
        status: child.triageStatus
      }
    })
  })

  return tr
}
