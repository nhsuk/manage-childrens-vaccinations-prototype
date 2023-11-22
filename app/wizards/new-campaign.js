import { wizard } from 'nhsuk-prototype-rig'

export function newCampaignWizard (req) {
  const { campaignId } = req.params
  const journey = {
    '/dashboard': {},
    [`/sessions/new/${campaignId}`]: {},
    [`/sessions/new/${campaignId}/where`]: {},
    [`/sessions/new/${campaignId}/which`]: {},
    [`/sessions/new/${campaignId}/when`]: {},
    [`/sessions/new/${campaignId}/check`]: {},
    [`/sessions/${campaignId}?success=1`]: {}
  }

  return wizard(journey, req)
}
