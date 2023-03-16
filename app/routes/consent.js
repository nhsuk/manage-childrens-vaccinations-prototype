import wizard from '../wizards/consent.js'
import _ from 'lodash'

export default (router) => {
  router.all([
    '/consent/:campaignId/:nhsNumber',
    '/consent/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.child = campaign.children.find(c => c.nhsNumber === req.params.nhsNumber)
    res.locals.paths = wizard(req)
    res.locals.base = `consent.${campaign.id}.${req.params.nhsNumber}.`

    next()
  })

  router.post([
    '/consent/:campaignId/:nhsNumber/child-details'
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
