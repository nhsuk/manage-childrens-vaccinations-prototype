import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, campaign, child) => {
  const nhsNumber = child.nhsNumber
  const campaignId = campaign.id
  const isUnknown = child.consent.unknown || child.consent[campaign.type] === 'Unknown'
  const refused = child.consent.refusedBoth || child.consent[campaign.type] === 'No'
  const hasConsent = !(isUnknown || refused)
  const askingForConsent = getData(data, `vaccination.${campaignId}.${nhsNumber}.get-consent`) !== 'No'
  const askForNoReason = getData(data, `vaccination.${campaignId}.${nhsNumber}.given`) === 'No'

  if (hasConsent && askForNoReason) {
    return {
      [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    }
  }

  if (!hasConsent && askingForConsent) {
    return {
      [`/vaccination/${campaignId}/${nhsNumber}/consent`]: {}
    }
  }

  if (!hasConsent && !askingForConsent) {
    return {
      [`/campaign/${campaignId}/children?noConsent=${nhsNumber}`]: {}
    }
  }

  return {}
}

const journeyFor3in1MenAcwy = (data, campaignId, child) => {
  const nhsNumber = child.nhsNumber
  const givenVaccines = getData(data, `vaccination.${campaignId}.${nhsNumber}.multi-given`) || []
  const askForNoMenAcwyReason = child.consent['men-acwy'] === 'Yes' && !givenVaccines.includes('men-acwy')
  const askForNo3in1Reason = child.consent['3-in-1'] === 'Yes' && !givenVaccines.includes('3-in-1')

  if (askForNoMenAcwyReason) {
    return {
      [`/men-acwy-vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    }
  }

  if (askForNo3in1Reason) {
    return {
      [`/3-in-1-vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    }
  }

  return {}
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
      : journeyForEverythingElse(req.session.data, campaign, child),
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {},
    [`/campaign/${campaignId}/children?success=${nhsNumber}`]: {}
  }

  return wizard(journey, req)
}
