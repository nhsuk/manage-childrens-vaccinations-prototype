import wizard from '../wizards/consent.js'
import _ from 'lodash'
import { CONSENT_OUTCOME, TRIAGE_OUTCOME, PATIENT_OUTCOME } from '../enums.js'
import { DateTime } from 'luxon'

export default (router) => {
  router.all([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.patient = campaign.cohort
      .find(patient => patient.nhsNumber === req.params.nhsNumber)
    res.locals.base = `consent.${campaign.id}.${req.params.nhsNumber}.`
    next()
  })

  router.all([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.paths = wizard(req, res, false)
    next()
  })

  router.post('/consent/:campaignId/:nhsNumber/health-questions', (req, res, next) => {
    const { patient } = res.locals
    const healthAnswers = {}
    const formAnswers = _.get(
      req.body,
      `consent.${req.params.campaignId}.${req.params.nhsNumber}.health`, {}
    )

    for (const key of Object.keys(formAnswers)) {
      if (key === 'details') {
        continue
      }

      if (formAnswers[key] === 'Yes') {
        patient.consent.answersNeedTriage = true

        // Use detail answer if provided, else return `true`
        healthAnswers[key] = formAnswers.details[key] || true
      } else {
        healthAnswers[key] = false
      }
    }

    // Add consent response
    patient.responses = [{ healthAnswers }]

    next()
  })

  // Copy consent values to the patient object
  router.post('/consent/:campaignId/:nhsNumber/confirm', (req, res, next) => {
    const { patient } = res.locals
    const consentData = req.session.data.consent[req.params.campaignId][req.params.nhsNumber]
    const triageData = req.session.data.triage[req.params.campaignId][req.params.nhsNumber]
    const gillickCompetent = consentData['gillick-competent'] === 'Yes'
    const assessedAsNotGillickCompetent = consentData['gillick-competent'] === 'No'

    patient.consent.outcome = consentData.consent
    patient.consent.responses = consentData.consent !== CONSENT_OUTCOME.NO_RESPONSE

    const consentResponse = patient.responses[0]
    consentResponse.date = DateTime.local().toISODate()
    consentResponse.method = 'Phone'

    const hasConsented = consentData.consent.outcome === CONSENT_OUTCOME.VALID
    if (hasConsented && triageData && triageData.outcome) {
      patient.triage.outcome = triageData.outcome

      // If triage outcome is not to vaccinate, set patient outcome
      if (triageData.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE) {
        patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      }
    }

    if (patient.consent.outcome === CONSENT_OUTCOME.REFUSED) {
      consentResponse.refusalReason = consentData.refusalReason
      consentResponse.refusalReasonOther = consentData.refusalReasonOther
    }

    if (gillickCompetent || assessedAsNotGillickCompetent) {
      next()
    } else {
      consentResponse.parentOrGuardian.fullName = consentData.parent.name
      consentResponse.parentOrGuardian.tel = consentData.parent.tel
      consentResponse.parentOrGuardian.relationship =
        (consentData.parent.relationship === 'Other' && consentData.parent.relationshipOther)
          ? consentData.parent.relationshipOther
          : consentData.parent.relationship

      next()
    }
  })

  router.get('/consent/:campaignId/:nhsNumber', (_req, res) => {
    res.render('consent/index')
  })

  router.get('/consent/:campaignId/:nhsNumber/:view', (req, res) => {
    res.render(`consent/${req.params.view}`)
  })

  router.post([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (_req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
