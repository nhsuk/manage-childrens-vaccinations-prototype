import _ from 'lodash'
import filters from './_filters.js'
import { vaccination } from '../wizards/vaccination.js'
import { PATIENT_OUTCOME, TRIAGE_OUTCOME } from '../enums.js'

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
    '/campaign/:campaignId/child/:nhsNumber',
    '/campaign/:campaignId/child/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.child = res.locals.campaign.children.find(c => c.nhsNumber === req.params.nhsNumber)
    if (res.locals.campaign.is3in1MenACWY) {
      res.locals['3in1Vaccination'] = _.get(req.session.data, `3-in-1-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
      res.locals.menAcwyVaccination = _.get(req.session.data, `men-acwy-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    } else {
      res.locals.vaccination = _.get(req.session.data, `vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    }

    res.locals.consentRecord = _.get(req.session.data, `consent.${req.params.campaignId}.${req.params.nhsNumber}`)
    res.locals.paths = vaccination(req)
    next()
  })

  router.post('/campaign/:campaignId/child/:nhsNumber', (req, res, next) => {
    const { child } = res.locals
    const { campaignId, nhsNumber } = req.params
    const { isTriage } = req.session.data
    const triage = _.get(req.body, `triage.${campaignId}.${nhsNumber}`, {})

    if (isTriage && triage) {
      child.triage.outcome = triage.outcome

      // If triage outcome is not to vaccinate, set patient outcome
      if (triage.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE) {
        child.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      }

      // Update triage notes
      if (triage.note) {
        child.triage.notes.push({
          date: new Date().toISOString(),
          note: triage.note,
          user: {
            name: 'Jacinta Dodds',
            email: 'jacinta.dodds@example.com'
          }
        })
      }

      res.redirect(`/campaign/${campaignId}/triage?success=${nhsNumber}`)
    } else {
      res.redirect(res.locals.paths.next)
    }
  })

  router.post('/campaign/:campaignId', (req, res, next) => {
    if (req.session.data.hasOfflineCode) {
      res.locals.campaign['available-offline'] = true
      next()
    } else {
      res.redirect(`/set-offline-code?campaignId=${req.params.campaignId}`)
    }
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
    '/campaign/:campaignId/record'
  ], (req, res, next) => {
    const campaign = req.session.data.campaigns[req.params.campaignId]

    if (req.query.noConsent) {
      res.locals.noConsent = req.query.noConsent
      const nhsNumber = req.query.noConsent
      const child = campaign.children.find(c => c.nhsNumber === nhsNumber)
      child.outcome = PATIENT_OUTCOME.NO_CONSENT
      child.seen.isOffline = res.locals.isOffline
      res.locals.successChild = child
    } else if (res.locals.success) {
      res.locals.successChild = campaign.children.find(c => {
        return c.nhsNumber === req.query.success
      })
    }

    next()
  })

  router.all([
    '/campaign/:campaignId/responses',
    '/campaign/:campaignId/triage',
    '/campaign/:campaignId/record'
  ], (req, res, next) => {
    res.locals.filters = filters(req, res)

    if (res.locals.success) {
      const campaign = req.session.data.campaigns[req.params.campaignId]
      res.locals.successChild = campaign.children.find(c => {
        return c.nhsNumber === req.query.success
      })
    }
    next()
  })

  router.all([
    '/campaign/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/${req.params.view}`)
  })
}
