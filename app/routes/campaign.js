import _ from 'lodash'
import filters from './_filters.js'
import getNote from '../fakers/note.js'
import { vaccination } from '../wizards/vaccination.js'
import { PATIENT_OUTCOME, TRIAGE_OUTCOME } from '../enums.js'

const offlineChangesCount = (campaign) => {
  const offlineCount = campaign?.cohort
    .reduce((count, patient) => count + (patient.seen.isOffline ? 1 : 0), 0)

  return offlineCount
}

export default (router) => {
  router.all([
    '/sessions/:campaignId',
    '/sessions/:campaignId/*'
  ], (req, res, next) => {
    const { campaigns } = res.locals
    const campaign = campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.campaignOfflineChangesCount = offlineChangesCount(campaign)

    // Will use this flag to show a message after offline changes have synced
    if (res.locals.campaignOfflineChangesCount > 0) {
      campaign.hadOfflineChanges = true
    }

    res.locals.filters = filters(req, res)

    next()
  })

  router.all([
    '/sessions/:campaignId/patient/:nhsNumber',
    '/sessions/:campaignId/patient/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.patient = res.locals.campaign.cohort
      .find(patient => patient.nhsNumber === req.params.nhsNumber)
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

  router.post('/sessions/:campaignId/patient/:nhsNumber', (req, res, next) => {
    const { patient } = res.locals
    const { campaignId, nhsNumber } = req.params
    const { flow } = req.query
    const triage = _.get(req.body, `triage.${campaignId}.${nhsNumber}`, {})

    if (flow === 'triage' && triage) {
      patient.triage.outcome = triage.outcome
      patient.triage.completed = true

      // If triage outcome is not to vaccinate, set patient outcome
      if (triage.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE) {
        patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      }

      // Update triage notes
      if (triage.note) {
        const { user } = req.session.data
        patient.triage.notes.push(getNote(triage.note, user, true))
      }

      res.redirect(`/sessions/${campaignId}/triage?success=${nhsNumber}`)
    } else {
      res.redirect(res.locals.paths.next)
    }
  })

  router.post('/sessions/:campaignId', (req, res, next) => {
    if (req.session.data.hasOfflineCode) {
      res.locals.campaign['available-offline'] = true
      next()
    } else {
      res.redirect(`/set-offline-code?campaignId=${req.params.campaignId}`)
    }
  })

  router.all([
    '/sessions/:campaignId'
  ], (req, res) => {
    res.render('campaign/index')
  })

  router.all([
    '/sessions/:campaignId/patient/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/patient')
  })

  router.all([
    '/sessions/:campaignId/record'
  ], (req, res, next) => {
    const campaign = req.session.data.campaigns[req.params.campaignId]

    if (req.query.noConsent) {
      res.locals.noConsent = req.query.noConsent
      const nhsNumber = req.query.noConsent
      const patient = campaign.cohort
        .find(patient => patient.nhsNumber === nhsNumber)
      patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      patient.seen.isOffline = res.locals.isOffline
    }

    next()
  })

  router.all([
    '/sessions/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/${req.params.view}`)
  })
}
