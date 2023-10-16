import { wizard } from 'nhsuk-prototype-rig'
import { CONSENT_OUTCOME, PATIENT_OUTCOME } from '../enums.js'

export default (req, res) => {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const basePath = `/consent/${campaignId}/${nhsNumber}`
  const baseData = `consent.${campaignId}.${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
    [basePath]: {},
    [`${basePath}/consent`]: {
      [`${basePath}/health-questions`]: {
        data: `${baseData}.consent`,
        value: CONSENT_OUTCOME.VALID
      },
      [`${basePath}/confirm`]: {
        data: `${baseData}.consent`,
        value: CONSENT_OUTCOME.NO_RESPONSE
      }
    },
    [`${basePath}/why-not-consenting`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/health-questions`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/confirm`]: {
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: true
    },

    [`/campaign/${campaignId}/patient/${nhsNumber}?gillick`]: {},
    [`${basePath}/pre-gillick`]: {},
    [`${basePath}/gillick`]: {
      [`${basePath}/consent?gillick`]: {
        data: `${baseData}.gillick-competent`,
        value: 'Yes'
      },
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: () => {
        res.locals.patient.outcome = PATIENT_OUTCOME.NO_CONSENT
        res.locals.patient.assessedAsNotGillickCompetent = true
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    },
    [`${basePath}/consent?gillick`]: {
      [`${basePath}/health-questions`]: {
        data: `${baseData}.consent`,
        value: CONSENT_OUTCOME.VALID
      },
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: () => {
        res.locals.patient.outcome = PATIENT_OUTCOME.NO_CONSENT
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    }
  }

  return wizard(journey, req)
}
