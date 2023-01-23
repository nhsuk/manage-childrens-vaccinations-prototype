import { wizard } from 'nhsuk-prototype-rig'

export function newCampaignWizard (req) {
  const campaignId = req.params.campaignId
  const journey = {
    '/dashboard': {},
    [`/campaign/new/${campaignId}`]: {},
    [`/campaign/new/${campaignId}/where`]: {},
    [`/campaign/new/${campaignId}/which`]: {},
    [`/campaign/new/${campaignId}/when`]: {},
    [`/campaign/new/${campaignId}/check`]: {},
    [`/campaign/${campaignId}?success=1`]: {}
  }

  return wizard(journey, req)
}
