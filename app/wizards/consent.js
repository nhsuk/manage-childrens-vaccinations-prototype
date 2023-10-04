import { wizard } from 'nhsuk-prototype-rig'
import { CONSENT_OUTCOME, PATIENT_OUTCOME } from '../enums.js'

export default (req, res, isTriage) => {
  const nhsNumber = req.params.nhsNumber
  const campaignId = req.params.campaignId
  const triagePath = isTriage ? 'triage-consent' : 'consent'
  const childPath = isTriage ? 'child-triage' : 'child'
  const basePath = `/${triagePath}/${campaignId}/${nhsNumber}`
  const baseData = `consent.${campaignId}.${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/${childPath}/${nhsNumber}`]: {},
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
      [`/campaign/${campaignId}/child-triage/${nhsNumber}`]: () => {
        return isTriage
      },
      [`/campaign/${campaignId}/child/${nhsNumber}`]: {
        data: `${baseData}.consent`,
        excludedValue: CONSENT_OUTCOME.VALID
      }
    },
    [`${basePath}/vaccinate`]: {
      [`/vaccination/${campaignId}/${nhsNumber}/not-given`]: {
        data: `vaccination.${campaignId}.${nhsNumber}.outcome`,
        value: 'false'
      }
    },
    [`/vaccination/${campaignId}/${nhsNumber}/details`]: {},

    [`/campaign/${campaignId}/child/${nhsNumber}?gillick`]: {},
    [`${basePath}/pre-gillick`]: {},
    [`${basePath}/gillick`]: {
      [`${basePath}/consent?gillick`]: {
        data: `${baseData}.gillick-competent`,
        value: 'Yes'
      },
      [`/campaign/${campaignId}/child/${nhsNumber}`]: () => {
        res.locals.child.outcome = PATIENT_OUTCOME.NO_CONSENT
        res.locals.child.assessedAsNotGillickCompetent = true
        res.locals.child.seen.isOffline = res.locals.isOffline
        return true
      }
    },
    [`${basePath}/consent?gillick`]: {
      [`${basePath}/health-questions`]: {
        data: `${baseData}.consent`,
        value: CONSENT_OUTCOME.VALID
      },
      [`/campaign/${campaignId}/child/${nhsNumber}`]: () => {
        res.locals.child.outcome = PATIENT_OUTCOME.NO_CONSENT
        res.locals.child.seen.isOffline = res.locals.isOffline
        return true
      }
    }
  }

  return wizard(journey, req)
}
