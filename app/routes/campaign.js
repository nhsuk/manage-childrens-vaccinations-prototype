import _ from 'lodash'
import filterChildren from './_filter-children.js'
import { vaccination } from '../wizards/vaccination.js'

const offlineChangesCount = (campaign) => {
  const offlineCount = campaign.children.reduce((count, child) => count + (child.seen.isOffline ? 1 : 0), 0)
  return offlineCount
}

export default (router) => {
  router.all([
    '/campaign/:campaignId',
    '/campaign/:campaignId/*'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.campaignOfflineChangesCount = offlineChangesCount(campaign)

    // Will use this flag to show a message after offline changes have synced
    if (res.locals.campaignOfflineChangesCount > 0) {
      campaign.hadOfflineChanges = true
    }

    next()
  })

  router.all([
    '/campaign/:campaignId/children',
    '/campaign/:campaignId/children-triage'
  ], (req, res, next) => {
    res.locals.filteredChildren = filterChildren(req.query, res.locals.campaign.children)
    next()
  })

  router.all([
    '/campaign/:campaignId/child/:nhsNumber',
    '/campaign/:campaignId/child/:nhsNumber/*',
    '/campaign/:campaignId/child-triage/:nhsNumber/',
    '/campaign/:campaignId/child-triage/:nhsNumber/*'
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
    '/campaign/:campaignId/child-triage/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/child-triage')
  })

  router.all([
    '/campaign/:campaignId/children'
  ], (req, res, next) => {
    if (req.query.noConsent) {
      res.locals.noConsent = req.query.noConsent
      const nhsNumber = req.query.noConsent
      const campaign = req.session.data.campaigns[req.params.campaignId]
      const child = campaign.children.find(c => c.nhsNumber === nhsNumber)
      child.outcome = 'No consent'
      child.seen.isOffline = res.locals.isOffline
    }
    next()
  })

  router.all([
    '/campaign/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/${req.params.view}`)
  })
}
