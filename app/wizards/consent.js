import { wizard } from 'nhsuk-prototype-rig'
import { RESPONSE_CONSENT } from '../enums.js'

export default (req, res) => {
  const { sessionId, nhsNumber } = req.params
  const basePath = `/consent/${sessionId}/${nhsNumber}`

  const journey = {
    [`/sessions/${sessionId}/patient/${nhsNumber}`]: {},
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
      [`/sessions/${sessionId}/responses?success=${nhsNumber}`]: true
    },

    [`${basePath}/pre-gillick`]: {},
    [`${basePath}/gillick`]: {
      [`${basePath}/consent?gillick`]: {
        data: 'response.gillickCompetent',
        value: 'Yes'
      },
      [`/sessions/${sessionId}/responses?success=${nhsNumber}`]: () => {
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    },
    [`${basePath}/consent?gillick`]: {
      [`${basePath}/health-questions`]: {
        data: 'response.status',
        value: RESPONSE_CONSENT.GIVEN
      },
      [`/sessions/${sessionId}/responses?success=${nhsNumber}`]: () => {
        res.locals.patient.seen.isOffline = res.locals.isOffline
        return true
      }
    }
  }

  return wizard(journey, req)
}
