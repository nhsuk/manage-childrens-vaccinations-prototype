import wizard from '../wizards/consent.js'
import _ from 'lodash'
import { CONSENT, ACTION_NEEDED, ACTION_TAKEN, OUTCOME, TRIAGE, TRIAGE_REASON } from '../enums.js'
import { DateTime } from 'luxon'

export default (router) => {
  router.all([
    '/triage-consent/:campaignId/:nhsNumber',
    '/triage-consent/:campaignId/:nhsNumber/:view',
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const { campaignId, nhsNumber } = req.params
    const campaign = req.session.data.campaigns[campaignId]

    res.locals.campaign = campaign
    res.locals.child = campaign.children.find(c => c.nhsNumber === nhsNumber)
    res.locals.base = `consent.${campaign.id}.${nhsNumber}.`
    next()
  })

  router.all([
    '/triage-consent/:campaignId/:nhsNumber',
    '/triage-consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.isTriage = true
    res.locals.paths = wizard(req, res, true)
    next()
  })

  router.all([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.paths = wizard(req, res, false)
    next()
  })

  router.post([
    '/triage-consent/:campaignId/:nhsNumber/health-questions',
    '/consent/:campaignId/:nhsNumber/health-questions'
  ], (req, res, next) => {
    const { child } = res.locals
    const { campaignId, nhsNumber } = req.params
    const formAnswers = _.get(
      req.body, `consent.${campaignId}.${nhsNumber}.health`, {}
    )
    const healthAnswers = {}

    for (const key of Object.keys(formAnswers)) {
      if (key === 'details') {
        continue
      }

      if (formAnswers[key] === 'Yes') {
        child.consent.answersNeedTriage = true

        // Use detail answer if provided, else return `true`
        healthAnswers[key] = formAnswers.details[key] || true
      } else {
        healthAnswers[key] = false
      }
    }

    child.consentResponses.push({
      healthAnswers
    })

    next()
  })

  // Copy consent values to the child object
  router.post([
    '/triage-consent/:campaignId/:nhsNumber/confirm',
    '/consent/:campaignId/:nhsNumber/confirm'
  ], (req, res, next) => {
    const { campaign, child, isTriage } = res.locals
    const { campaignId, nhsNumber } = req.params
    const { data } = req.session
    const consentData = data.consent[campaignId][nhsNumber]
    const triageData = data.triage[campaignId][nhsNumber]
    const gillickCompetent = consentData['gillick-competent'] === 'Yes'
    const assessedAsNotGillickCompetent = consentData['gillick-competent'] === 'No'

    // Create/update first consent response
    const consentResponse = child.consentResponses[0] || {}
    consentResponse[campaign.type] = consentData.consent
    consentResponse.date = DateTime.local().toISODate()
    consentResponse.method = 'Telephone'
    consentResponse.parentOrGuardian = {}

    // Update derived consent values
    child.consent[campaign.type] = consentData.consent
    child.consent.text = consentData.consent
    child.consent.consented = consentData.consent === CONSENT.GIVEN
    child.consent.refused = consentData.consent === CONSENT.REFUSED
    child.consent.unknown = consentData.consent === CONSENT.UNKNOWN
    child.consent.responses = consentData.consent !== CONSENT.UNKNOWN

    // Update triage status, reasons and actions
    if (child.consent.consented && triageData && triageData.status) {
      child.triageStatus = triageData.status
      if (triageData.status === TRIAGE.READY) {
        child.actionNeeded = ACTION_NEEDED.VACCINATE
        child.triageCompleted = true
      } else if (triageData.status === TRIAGE.NEEDS_FOLLOW_UP) {
        child.actionNeeded = ACTION_NEEDED.FOLLOW_UP
        child.needsTriage = true
        child.triageReasons = [TRIAGE_REASON.NURSE_REQUESTED]
        child.triageCompleted = false
      } else if (triageData.status === TRIAGE.DO_NOT_VACCINATE) {
        child.actionNeeded = ACTION_NEEDED.NONE
        child.actionTaken = ACTION_TAKEN.DO_NOT_VACCINATE
        child.needsTriage = true
        child.triageReasons = [TRIAGE_REASON.NURSE_REQUESTED]
        child.triageCompleted = true
      }
    } else if (child.consent.consented) {
      child.actionNeeded = ACTION_NEEDED.VACCINATE
      child.actionTaken = null
      child.triageCompleted = isTriage
    }

    if (child.consent.refused) {
      consentResponse.reason = consentData['no-consent-reason']
      consentResponse.reasonDetails = consentData['no-consent-reason-details']
      child.consent.refusalReasons = [consentData['no-consent-reason']]
      child.actionNeeded = ACTION_NEEDED.NONE
      child.actionTaken = ACTION_TAKEN.DO_NOT_VACCINATE
      child.needsTriage = false
      child.triageCompleted = true
      child.outcome = OUTCOME.NO_CONSENT
    }

    if (!gillickCompetent || !assessedAsNotGillickCompetent) {
      consentResponse.parentOrGuardian.fullName = consentData.parent.name
      consentResponse.parentOrGuardian.telephone = consentData.parent.telephone
      consentResponse.parentOrGuardian.relationship =
        (consentData.parent.relationship === 'Other' && consentData.parent['relationship-other'])
          ? consentData.parent['relationship-other']
          : consentData.parent.relationship
    }

    child.consentResponses.push(consentResponse)

    next()
  })

  router.get([
    '/triage-consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber'
  ], (_req, res) => {
    res.render('consent/index')
  })

  router.get([
    '/triage-consent/:campaignId/:nhsNumber/:view',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res) => {
    res.render(`consent/${req.params.view}`)
  })

  router.post([
    '/triage-consent/:campaignId/:nhsNumber',
    '/triage-consent/:campaignId/:nhsNumber/:view',
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (_req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
