import { CONSENT_OUTCOME, VACCINATION_OUTCOME } from '../enums.js'
import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, campaign, patient) => {
  const nhsNumber = patient.nhsNumber
  const campaignId = campaign.id
  const hasDefaultBatch = !!data['todays-batch']
  const vaccinationOutcome = getData(data, `vaccination.${campaignId}.${nhsNumber}.outcome`)
  const vaccineGiven =
    (vaccinationOutcome === VACCINATION_OUTCOME.VACCINATED) ||
    (vaccinationOutcome === VACCINATION_OUTCOME.PART_VACCINATED)

  const journey = {}

  if (!vaccineGiven) {
    return {
      [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {}
    }
  }

  if (campaign.type === 'HPV') {
    journey[`/vaccination/${campaignId}/${nhsNumber}/site`] = {}
  }

  if (!hasDefaultBatch) {
    journey[`/vaccination/${campaignId}/${nhsNumber}/batch`] = {}
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
  const { campaignId, nhsNumber } = req.params
  const campaign = req.session.data.campaigns[campaignId]
  const patient = campaign.cohort
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
