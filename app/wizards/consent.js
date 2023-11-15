import { wizard } from 'nhsuk-prototype-rig'
import { RESPONSE_CONSENT } from '../enums.js'

export const consentWizard = (req, res) => {
  const { campaignId, nhsNumber, id } = req.params
  const basePath = `/consent/${campaignId}/${nhsNumber}/${id}`

  const journeys = {
    // Confirm refusal from an existing respondent
    confirm: {
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
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
      [`${basePath}/refusal-reason`]: {
        [`${basePath}/confirm`]: true
      },
      [`${basePath}/health-questions`]: {},
      [`${basePath}/confirm`]: {
        [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: true
      }
    },
    // Select and contact a parent from external record
    contact: {
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
      [`${basePath}/refusal-reason`]: {
        [`${basePath}/confirm`]: true
      },
      [`${basePath}/health-questions`]: {},
      [`${basePath}/confirm`]: {
        [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: true
      }
    },
    // Assess gillick consent
    gillick: {
      [`/campaign/${campaignId}/patient/${nhsNumber}`]: {},
      [`${basePath}/start`]: {},
      [`${basePath}/assessment`]: {
        [`${basePath}/consent`]: {
          data: 'response.gillickCompetent',
          value: 'Yes'
        },
        [`${basePath}/confirm`]: true
      },
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
      [`${basePath}/health-questions`]: {},
      [`${basePath}/confirm`]: {
        [`/campaign/${campaignId}/responses?success=${nhsNumber}`]: () => {
          res.locals.patient.seen.isOffline = res.locals.isOffline
          return true
        }
      }
    }
  }

  // Use named journey, else use confirm journey
  const paths = journeys[id] || journeys.confirm

  return wizard(paths, req)
}
