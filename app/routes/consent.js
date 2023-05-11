import wizard from '../wizards/consent.js'
import _ from 'lodash'
import { CONSENT } from '../enums.js'
import { DateTime } from 'luxon'

export default (router) => {
  router.all([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.child = campaign.children.find(c => c.nhsNumber === req.params.nhsNumber)
    res.locals.paths = wizard(req, res)
    res.locals.base = `consent.${campaign.id}.${req.params.nhsNumber}.`

    next()
  })

  router.post([
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
    '/consent/:campaignId/:nhsNumber/confirm'
  ], (req, res, next) => {
    const child = res.locals.child
    const campaign = res.locals.campaign
    const campaignType = campaign.type
    const consentData = req.session.data.consent[req.params.campaignId][req.params.nhsNumber]

    child.consent[campaignType] = consentData.consent
    child.consent.text = consentData.consent
    child.consent.consented = consentData.consent === CONSENT.GIVEN
    child.consent.refused = consentData.consent === CONSENT.REFUSED
    child.consent.responded = !consentData.consent === CONSENT.UNKNOWN
    child.consentedDate = DateTime.local().toISODate()
    child.consentedMethod = 'Telephone'

    child.parentOrGuardian.fullName = consentData.parent.name
    child.parentOrGuardian.telephone = consentData.parent.telephone
    child.parentOrGuardian.relationship =
      (consentData.parent.relationship === 'Other' && consentData.parent['relationship-other'])
        ? consentData.parent['relationship-other']
        : consentData.parent.relationship

    next()
  })

  router.all([
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
    '/consent/:campaignId/:nhsNumber'
  ], (_req, res) => {
    res.render('consent/index')
  })

  router.get([
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res) => {
    res.render(`consent/${req.params.view}`)
  })

  router.post([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (_req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
