import _ from 'lodash'
import filters from './_filters.js'
import getNote from '../fakers/note.js'
import { vaccination } from '../wizards/vaccination.js'
import { PATIENT_OUTCOME, TRIAGE_OUTCOME } from '../enums.js'

const offlineChangesCount = (session) => {
  const offlineCount = session?.cohort
    .reduce((count, patient) => count + (patient.seen.isOffline ? 1 : 0), 0)

  return offlineCount
}

export default (router) => {
  router.all([
    '/sessions/:sessionId',
    '/sessions/:sessionId/*'
  ], (req, res, next) => {
    const { sessions } = req.session.data
    const session = sessions[req.params.sessionId]

    res.locals.session = session
    res.locals.sessionOfflineChangesCount = offlineChangesCount(session)

    // Will use this flag to show a message after offline changes have synced
    if (res.locals.sessionOfflineChangesCount > 0) {
      session.hadOfflineChanges = true
    }

    res.locals.filters = filters(req, res)

    next()
  })

  router.all([
    '/sessions/:sessionId/patient/:nhsNumber',
    '/sessions/:sessionId/patient/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.patient = res.locals.session.cohort
      .find(patient => patient.nhsNumber === req.params.nhsNumber)
    if (res.locals.session.is3in1MenACWY) {
      res.locals['3in1Vaccination'] = _.get(req.session.data, `3-in-1-vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
      res.locals.menAcwyVaccination = _.get(req.session.data, `men-acwy-vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
    } else {
      res.locals.vaccination = _.get(req.session.data, `vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
    }

    res.locals.consentRecord = _.get(req.session.data, `consent.${req.params.sessionId}.${req.params.nhsNumber}`)
    res.locals.paths = vaccination(req)
    next()
  })

  router.post('/sessions/:sessionId/patient/:nhsNumber', (req, res, next) => {
    const { patient } = res.locals
    const { sessionId, nhsNumber } = req.params
    const { flow } = req.query
    const triage = _.get(req.body, `triage.${sessionId}.${nhsNumber}`, {})

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

      res.redirect(`/sessions/${sessionId}/triage?success=${nhsNumber}`)
    } else {
      res.redirect(res.locals.paths.next)
    }
  })

  router.post('/sessions/:sessionId', (req, res, next) => {
    if (req.session.data.hasOfflineCode) {
      res.locals.session['available-offline'] = true
      next()
    } else {
      res.redirect(`/set-offline-code?sessionId=${req.params.sessionId}`)
    }
  })

  router.all([
    '/sessions/:sessionId'
  ], (req, res) => {
    res.render('sessions/session')
  })

  router.all([
    '/sessions/:sessionId/patient/:nhsNumber'
  ], (req, res) => {
    res.render('patient/index')
  })

  router.all([
    '/sessions/:sessionId/record'
  ], (req, res, next) => {
    const session = req.session.data.sessions[req.params.sessionId]

    if (req.query.noConsent) {
      res.locals.noConsent = req.query.noConsent
      const nhsNumber = req.query.noConsent
      const patient = session.cohort
        .find(patient => patient.nhsNumber === nhsNumber)
      patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      patient.seen.isOffline = res.locals.isOffline
    }

    next()
  })

  router.all([
    '/sessions/:sessionId/:view'
  ], (req, res) => {
    res.render(`sessions/${req.params.view}`)
  })
}
