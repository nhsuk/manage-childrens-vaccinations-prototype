import { wizard } from 'nhsuk-prototype-rig'

export default (req) => {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const campaign = req.session.data.campaigns[campaignId]
  const child = campaign.children.find(p => p.nhsNumber === req.params.nhsNumber)
  const basePath = `/consent/${campaignId}/${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/child/${nhsNumber}`]: {},
    [basePath]: {},
    [`${basePath}/consent`]: {},
    [`${basePath}/child-details`]: {},
    [`${basePath}/details`]: {},
    [`${basePath}/vaccinate`]: {},
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {}
  }

  return wizard(journey, req)
}
