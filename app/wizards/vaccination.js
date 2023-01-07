import { wizard } from 'nhsuk-prototype-rig'

export function vaccination (req) {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const data = req.session.data
  const campaign = data.campaigns[campaignId]

  const journey = {
    [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
    ...campaign.is3in1MenACWY
      ? {
        [`/vaccination/${campaignId}/${nhsNumber}/which-first`]: {
          [`/vaccination/${campaignId}/${nhsNumber}/3-in-1`]: {
            data: `vaccination.${campaignId}.${nhsNumber}.which-first`,
            value: '3 in 1'
          }
        }
      }
      : {},
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
