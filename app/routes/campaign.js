import _ from 'lodash'
import filterChildren from './_filter-children.js'
import { vaccination } from '../wizards/vaccination.js'
import { ACTION_NEEDED, ACTION_TAKEN, TRIAGE } from '../enums.js'

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

    res.locals.consentRecord = _.get(req.session.data, `consent.${req.params.campaignId}.${req.params.nhsNumber}`)
    res.locals.paths = vaccination(req)
    next()
  })

  router.post([
    '/campaign/:campaignId/child/:nhsNumber'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })

  router.post([
    '/campaign/:campaignId/child-triage/:nhsNumber'
  ], (req, res) => {
    const { child } = res.locals
    const { campaignId, nhsNumber } = req.params
    const triage = _.get(req.body, `triage.${campaignId}.${nhsNumber}`, {})

    if (triage) {
      child.triageStatus = triage.status
      if (triage.status === TRIAGE.READY) {
        child.actionNeeded = ACTION_NEEDED.VACCINATE
        child.triageCompleted = true
      } else if (triage.status === TRIAGE.NEEDS_FOLLOW_UP) {
        child.actionNeeded = ACTION_NEEDED.FOLLOW_UP
      } else if (triage.status === TRIAGE.DO_NOT_VACCINATE) {
        child.actionNeeded = ACTION_NEEDED.NONE
        child.actionTaken = ACTION_TAKEN.DO_NOT_VACCINATE
        child.triageCompleted = true
      }
    }

    // Update triage notes
    if (triage.note) {
      child.triageNotes.push({
        date: new Date().toISOString(),
        note: triage.note,
        user: {
          name: 'Jacinta Dodds',
          email: 'jacinta.dodds@example.com'
        }
      })
    }

    res.redirect(`/campaign/${campaignId}/children-triage?success=${nhsNumber}&area=triage`)
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
    '/campaign/:campaignId/child-triage/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/child-triage')
  })

  router.all([
    '/campaign/:campaignId/children'
  ], (req, res, next) => {
    const campaign = req.session.data.campaigns[req.params.campaignId]

    if (req.query.noConsent) {
      res.locals.noConsent = req.query.noConsent
      const nhsNumber = req.query.noConsent
      const child = campaign.children.find(c => c.nhsNumber === nhsNumber)
      child.actionTaken = ACTION_TAKEN.COULD_NOT_GET_CONSENT
      child.outcome = 'No consent'
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
    '/campaign/:campaignId/children',
    '/campaign/:campaignId/children-triage'
  ], (req, res, next) => {
    res.locals.filteredChildren = filterChildren(req, res)

    if (res.locals.success) {
      const campaign = req.session.data.campaigns[req.params.campaignId]
      res.locals.successChild = campaign.children.find(c => {
        return c.nhsNumber === req.query.success
      })
      res.locals.area = req.query.area
    }
    next()
  })

  router.all([
    '/campaign/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/${req.params.view}`)
  })
}
