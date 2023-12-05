import { CONSENT_OUTCOME, VACCINATION_OUTCOME } from '../enums.js'
import { wizard } from 'nhsuk-prototype-rig'
import _ from 'lodash'

const getData = (data, keyPath) => {
  return _.get(data, _.toPath(keyPath))
}

const journeyForEverythingElse = (data, session, patient) => {
  const { nhsNumber } = patient
  const { id, type } = session
  const hasDefaultBatch = !!data['todays-batch']
  const site = getData(data, `vaccination.${id}.${nhsNumber}.site`)
  const outcome = getData(data, `vaccination.${id}.${nhsNumber}.outcome`)
  const vaccineGiven =
    (outcome === VACCINATION_OUTCOME.VACCINATED) ||
    (outcome === VACCINATION_OUTCOME.PART_VACCINATED)

  const journey = {}

  if (!vaccineGiven) {
    return {
      [`/vaccination/${id}/${nhsNumber}/not-given`]: {}
    }
  }

  if (type === 'HPV' && site === 'Other') {
    journey[`/vaccination/${id}/${nhsNumber}/site`] = {}
  }

  if (!hasDefaultBatch) {
    journey[`/vaccination/${id}/${nhsNumber}/batch`] = {}
  }

  return journey
}

const journeyFor3in1MenAcwy = (data, sessionId, patient) => {
  const { nhsNumber } = patient
  const givenVaccines = getData(data, `vaccination.${sessionId}.${nhsNumber}.multi-given`) || []
  const askForNoMenAcwyReason = patient.consent.outcome === CONSENT_OUTCOME.ONLY_MENACWY && !givenVaccines.includes('men-acwy')
  const askForNo3in1Reason = patient.consent.outcome === CONSENT_OUTCOME.ONLY_3_IN_1 && !givenVaccines.includes('3-in-1')

  if (askForNoMenAcwyReason) {
    return {
      [`/men-acwy-vaccination/${sessionId}/${nhsNumber}/not-given`]: {}
    }
  }

  if (askForNo3in1Reason) {
    return {
      [`/3-in-1-vaccination/${sessionId}/${nhsNumber}/not-given`]: {}
    }
  }

  return {}
}

export function vaccination (req) {
  const { sessionId, nhsNumber } = req.params
  const { data } = req.session
  const session = data.sessions[sessionId]
  const patient = session.cohort
    .find(patient => patient.nhsNumber === nhsNumber)

  const journey = {
    [`/sessions/${sessionId}/patient/${nhsNumber}`]: {},
    ...session.is3in1MenACWY
      ? journeyFor3in1MenAcwy(data, sessionId, patient)
      : journeyForEverythingElse(data, session, patient),
    [`/vaccination/${sessionId}/${nhsNumber}/confirm`]: {},
    [`/sessions/${sessionId}/record?success=${nhsNumber}`]: {}
  }

  return wizard(journey, req)
}
