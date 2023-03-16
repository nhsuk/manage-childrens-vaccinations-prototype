import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

export default (req) => {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const campaign = req.session.data.campaigns[campaignId]
  const child = campaign.children.find(p => p.nhsNumber === req.params.nhsNumber)
  const basePath = `/consent/${campaignId}/${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/child/${nhsNumber}`]: {},
    [basePath]: {}
  }

  return wizard(journey, req)
}
