import { CONSENT_OUTCOME, VACCINATION_OUTCOME, VACCINATION_SITE } from '../enums.js'
import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, campaign, patient) => {
  const nhsNumber = patient.nhsNumber
  const campaignId = campaign.id
  const hasDefaultBatch = !!data['todays-batch']
  const hasNoResponse = patient.consent.outcome === CONSENT_OUTCOME.NO_RESPONSE
  const hasRefused = patient.consent.outcome === CONSENT_OUTCOME.REFUSED
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

const journeyFor3in1MenAcwy = (data, campaignId, patient) => {
  const nhsNumber = patient.nhsNumber
  const givenVaccines = getData(data, `vaccination.${campaignId}.${nhsNumber}.multi-given`) || []
  const askForNoMenAcwyReason = patient.consent.outcome === CONSENT_OUTCOME.ONLY_MENACWY && !givenVaccines.includes('men-acwy')
  const askForNo3in1Reason = patient.consent.outcome === CONSENT_OUTCOME.ONLY_3_IN_1 && !givenVaccines.includes('3-in-1')

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
  const patient = campaign.children
    .find(patient => patient.nhsNumber === req.params.nhsNumber)

  const journey = {
    [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
    ...campaign.is3in1MenACWY
      ? journeyFor3in1MenAcwy(req.session.data, campaignId, patient)
      : journeyForEverythingElse(req.session.data, campaign, patient),
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {},
    [`/campaign/${campaignId}/record?success=${nhsNumber}`]: {}
  }

  return wizard(journey, req)
}
