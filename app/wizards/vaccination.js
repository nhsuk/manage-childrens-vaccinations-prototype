import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, campaignId, nhsNumber) => {
  const askForNoReason = getData(data, `vaccination.${campaignId}.${nhsNumber}.given`) === 'No'
  return askForNoReason ? {
    [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
  } : {}
}

const journeyFor3in1MenAcwy = (data, campaignId, child) => {
  const nhsNumber = child.nhsNumber
  const givenVaccines = getData(data, `vaccination.${campaignId}.${nhsNumber}.multi-given`) || []
  const askForNoMenAcwyReason = child.consent['men-acwy'] && !givenVaccines.includes('men-acwy')
  const askForNo3in1Reason = child.consent['3-in-1'] && !givenVaccines.includes('3-in-1')

  return {
    ...askForNoMenAcwyReason ? {
      [`/men-acwy-vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    } : {},
    ...askForNo3in1Reason ? {
      [`/3-in-1-vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    } : {}
  }
}

export function vaccination (req) {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const campaign = req.session.data.campaigns[campaignId]
  const child = campaign.children.find(p => p.nhsNumber === req.params.nhsNumber)

  const journey = {
    [`/campaign/${campaignId}/child/${nhsNumber}`]: {},
    ...campaign.is3in1MenACWY
      ? journeyFor3in1MenAcwy(req.session.data, campaignId, child)
      : journeyForEverythingElse(req.session.data, campaignId, nhsNumber),
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {},
    [`/campaign/${campaignId}/children?success=${nhsNumber}`]: {}
  }

  return wizard(journey, req)
}
