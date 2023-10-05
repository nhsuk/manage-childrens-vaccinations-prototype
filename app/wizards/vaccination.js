import { CONSENT_OUTCOME, VACCINATION_OUTCOME, VACCINATION_SITE } from '../enums.js'
import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, campaign, child) => {
  const nhsNumber = child.nhsNumber
  const campaignId = campaign.id
  const hasDefaultBatch = !!data['todays-batch']
  const hasNoResponse = child.consent.outcome === CONSENT_OUTCOME.NO_RESPONSE
  const hasRefused = child.consent.outcome === CONSENT_OUTCOME.REFUSED
  const hasConsent = !(hasNoResponse || hasRefused)
  const askingForConsent = getData(data, `vaccination.${campaignId}.${nhsNumber}.get-consent`) !== 'No'
  const askForNoReason = getData(data, `vaccination.${campaignId}.${nhsNumber}.outcome`) !== VACCINATION_OUTCOME.VACCINATED
  const isOtherSite = getData(data, `vaccination.${campaignId}.${nhsNumber}.site`) === VACCINATION_SITE.OTHER

  const journey = {}

  if (hasConsent && askForNoReason) {
    return {
      [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    }
  }

  if (!hasConsent && askingForConsent) {
    const consentType = getData(data, `vaccination.${campaignId}.${nhsNumber}.get-consent`)
    if (consentType === 'Gillick') {
      return {
        [`/consent/${campaignId}/${nhsNumber}/pre-gillick`]: {}
      }
    }

    return {
      [`/consent/${campaignId}/${nhsNumber}`]: {}
    }
  }

  if (!hasConsent && !askingForConsent) {
    return {
      [`/campaign/${campaignId}/record?noConsent=${nhsNumber}`]: {}
    }
  }

  if (isOtherSite) {
    journey[`/vaccination/${campaignId}/${nhsNumber}/other-site`] = {}
  }

  if (!hasDefaultBatch) {
    journey[`/vaccination/${campaignId}/${nhsNumber}/which-batch`] = {}
  }

  return journey
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
    [`/campaign/${campaignId}/record?success=${nhsNumber}`]: {}
  }

  return wizard(journey, req)
}
