import _ from 'lodash'
import { vaccination } from '../wizards/vaccination.js'

export const campaignRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/campaign/:campaignId',
    '/campaign/:campaignId/*'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    next()
  })

  router.all([
    '/campaign/:campaignId/child/:nhsNumber',
    '/campaign/:campaignId/child/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.child = res.locals.campaign.children.find(c => c.nhsNumber === req.params.nhsNumber)
    if (res.locals.campaign.is3in1MenACWY) {
      res.locals['3in1VaccinationRecord'] = _.get(req.session.data, `3-in-1-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
      res.locals.menAcwyVaccinationRecord = _.get(req.session.data, `men-acwy-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    } else {
      res.locals.vaccinationRecord = _.get(req.session.data, `vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    }

    res.locals.paths = vaccination(req)
    next()
  })

  router.post([
    '/campaign/:campaignId/child/:nhsNumber'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })

  router.post('/campaign/:campaignId', (req, res, next) => {
    res.locals.campaign['available-offline'] = true
    next()
  })

  router.all([
    '/campaign/:campaignId'
  ], (req, res) => {
    res.render('campaign/index')
  })

  router.all([
    '/campaign/:campaignId/child/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/child')
  })

  router.all([
    '/campaign/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/${req.params.view}`)
  })
}
