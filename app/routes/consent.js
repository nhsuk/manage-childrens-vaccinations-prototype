import wizard from '../wizards/consent.js'
import _ from 'lodash'
import { CONSENT, ACTION_NEEDED } from '../enums.js'
import { DateTime } from 'luxon'

export default (router) => {
  router.all([
    '/triage-consent/:campaignId/:nhsNumber',
    '/triage-consent/:campaignId/:nhsNumber/:view',
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.child = campaign.children.find(c => c.nhsNumber === req.params.nhsNumber)
    res.locals.base = `consent.${campaign.id}.${req.params.nhsNumber}.`
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
    const child = res.locals.child
    const healthAnswers = _.get(
      req.body,
      `consent.${req.params.campaignId}.${req.params.nhsNumber}.health`, {}
    )

    for (const [key, value] of Object.entries(healthAnswers)) {
      if (key === 'details') {
        continue
      }

      const details = healthAnswers.details[key] || false
      const question = child.healthQuestions.questions.find(q => q.id === key)
      if (question) {
        question.answer = value

        if (value === 'Yes' || details) {
          child.healthQuestions.hasAnswers = true
        }

        if (details) {
          question.details = details
        }
      }
    }

    next()
  })

  // Copy consent values to the child object
  router.post([
    '/triage-consent/:campaignId/:nhsNumber/confirm',
    '/consent/:campaignId/:nhsNumber/confirm'
  ], (req, res, next) => {
    const child = res.locals.child
    const campaign = res.locals.campaign
    const campaignType = campaign.type
    const consentData = req.session.data.consent[req.params.campaignId][req.params.nhsNumber]

    const gillickCompetent = consentData['gillick-competent'] === 'Yes'
    const assessedAsNotGillickCompetent = consentData['gillick-competent'] === 'No'

    child.consent[campaignType] = consentData.consent
    child.consent.text = consentData.consent
    child.consent.consented = consentData.consent === CONSENT.GIVEN
    child.consent.refused = consentData.consent === CONSENT.REFUSED
    child.consent.responded = consentData.consent !== CONSENT.UNKNOWN
    child.consentedDate = DateTime.local().toISODate()
    child.consentedMethod = 'Telephone'

    if (child.consent.consented) {
      child.actionNeeded = 'Vaccinate'
      child.actionTaken = null
      if (res.locals.isTriage) {
        child.triageCompleted = true
      }
    }

    if (child.consent.refused) {
      child.consent.reason = consentData['no-consent-reason']
      child.actionTaken = 'Do not vaccinate'
      child.actionNeeded = ACTION_NEEDED.CHECK_REFUSAL
    }

    if (gillickCompetent || assessedAsNotGillickCompetent) {
      next()
    } else {
      child.parentOrGuardian.fullName = consentData.parent.name
      child.parentOrGuardian.telephone = consentData.parent.telephone
      child.parentOrGuardian.relationship =
        (consentData.parent.relationship === 'Other' && consentData.parent['relationship-other'])
          ? consentData.parent['relationship-other']
          : consentData.parent.relationship

      next()
    }
  })

  router.all([
    '/triage-consent/:campaignId/:nhsNumber/details',
    '/consent/:campaignId/:nhsNumber/details'
  ], (req, res, next) => {
    // set the medical health question options for the summary list
    const questions = res.locals.child.healthQuestions.questions
    const options = []
    const data = req.session.data

    questions.forEach(q => {
      const option = {
        key: q.question,
        value: data.consent[req.params.campaignId][req.params.nhsNumber].health[q.id]
      }

      options.push(option)
    })

    res.locals.healthQuestions = options
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
