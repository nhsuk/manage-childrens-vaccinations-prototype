import { wizard } from 'nhsuk-prototype-rig'

export default (req) => {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const basePath = `/consent/${campaignId}/${nhsNumber}`
  const baseData = `consent.${campaignId}.${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/child/${nhsNumber}`]: {},
    [basePath]: {},
    [`${basePath}/consent`]: {
      [`${basePath}/health-questions`]: {
        data: `${baseData}.consent`,
        excludedValue: 'No'
      }
    },
    [`${basePath}/why-not-consenting`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/health-questions`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/confirm`]: {
      [`/campaign/${campaignId}/child/${nhsNumber}`]: {
        data: `${baseData}.consent`,
        value: 'No'
      }
    },
    [`${basePath}/vaccinate`]: {
      [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {
        data: `vaccination.${campaignId}.${nhsNumber}.given`,
        value: 'No'
      }
    },
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {}
  }

  return wizard(journey, req)
}
