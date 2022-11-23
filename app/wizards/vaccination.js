import { wizard } from 'nhsuk-prototype-rig'

export function vaccination (req) {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId

  const journey = {
    [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
    [`/vaccination/${campaignId}/${nhsNumber}`]: {},
    [`/vaccination/${campaignId}/${nhsNumber}/has-it-been-given`]: {
      [`/vaccination/${campaignId}/${nhsNumber}/details`]: {
        data: `vaccination.${campaignId}.${nhsNumber}.given`,
        excludedValue: 'No'
      }
    },
    [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {},
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {},
    [`/vaccination/${campaignId}/${nhsNumber}/confirmation`]: {
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: true
    },
    [`/campaign/${campaignId}/`]: {}
  }

  return wizard(journey, req)
}
