import { wizard } from 'nhsuk-prototype-rig'
import { RESPONSE_CONSENT } from '../enums.js'

export default (req, res) => {
  const { campaignId, nhsNumber } = req.params
  const basePath = `/consent/${campaignId}/${nhsNumber}`

  const journey = {
    [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
    [basePath]: {},
    [`${basePath}/consent`]: {
      [`${basePath}/health-questions`]: {
        data: 'response.status',
        value: RESPONSE_CONSENT.GIVEN
      },
      [`${basePath}/confirm`]: {
        data: 'response.status',
        value: RESPONSE_CONSENT.NO_RESPONSE
      }
    },
    [`${basePath}/why-not-consenting`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/health-questions`]: {
      [`${basePath}/confirm`]: true
    },
    [`${basePath}/confirm`]: {
      [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: true
    },

    [`${basePath}/pre-gillick`]: {},
    [`${basePath}/gillick`]: {
      [`${basePath}/consent?gillick`]: {
        data: 'response.gillickCompetent',
        value: 'Yes'
      },
      [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: () => {
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    },
    [`${basePath}/consent?gillick`]: {
      [`${basePath}/health-questions`]: {
        data: 'response.status',
        value: RESPONSE_CONSENT.GIVEN
      },
      [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: () => {
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    }
  }

  return wizard(journey, req)
}
