import { vaccination } from '../wizards/vaccination.js'
import { PATIENT_OUTCOME, VACCINATION_OUTCOME } from '../enums.js'
import _ from 'lodash'

export default (router) => {
  router.all([
    '/3-in-1-vaccination/:sessionId/',
    '/3-in-1-vaccination/:sessionId/:nhsNumber',
    '/3-in-1-vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.type = '3-in-1'
    res.locals.dataLocation = '3-in-1-vaccination'
    res.locals.is3in1 = true
    next()
  })

  router.all([
    '/men-acwy-vaccination/:sessionId/',
    '/men-acwy-vaccination/:sessionId/:nhsNumber',
    '/men-acwy-vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.type = 'MenACWY'
    res.locals.dataLocation = 'men-acwy-vaccination'
    res.locals.isMenACWY = true
    next()
  })

  router.all([
    '/vaccination/:sessionId/',
    '/vaccination/:sessionId/:nhsNumber',
    '/vaccination/:sessionId/:nhsNumber/:view',
    '/3-in-1-vaccination/:sessionId/',
    '/3-in-1-vaccination/:sessionId/:nhsNumber',
    '/3-in-1-vaccination/:sessionId/:nhsNumber/:view',
    '/men-acwy-vaccination/:sessionId/',
    '/men-acwy-vaccination/:sessionId/:nhsNumber',
    '/men-acwy-vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const session = data.sessions[req.params.sessionId]

    res.locals.session = session
    res.locals.patient = session.cohort
      .find(patient => patient.nhsNumber === req.params.nhsNumber)
    res.locals.paths = vaccination(req)
    next()
  })

  router.all([
    '/vaccination/:sessionId/',
    '/vaccination/:sessionId/:nhsNumber',
    '/vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.type = res.locals.session.type
    res.locals.dataLocation = 'vaccination'
    res.locals.vaccination = _.get(req.session.data, `vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
    next()
  })

  router.all([
    '/vaccination/:sessionId/:nhsNumber/batch'
  ], (req, res, next) => {
    const sessionType = res.locals.session.type
    const batchesForSession = Object
      .values(req.session.data.vaccines.batches)
      .filter(b => b.vaccine === sessionType)

    res.locals.batchItems = batchesForSession.map(v => v.name)
    next()
  })

  router.all([
    '/vaccination/:sessionId/:nhsNumber/batch'
  ], (req, res, next) => {
    const body = req.body

    // Set today's default batch
    // Look at all `todays-batch-` fields and find the first one that has a value
    const todaysBatch = Object
      .keys(body)
      .filter(k => k.startsWith('todays-batch'))
      .map(k => body[k])
      .filter(v => Array.isArray(v) && v.length > 0)
      .flat()

    if (todaysBatch.length > 0) {
      req.session.data['todays-batch'] = todaysBatch[0]
    }

    next()
  })

  router.all([
    '/vaccination/:sessionId/:nhsNumber/details'
  ], (req, res, next) => {
    res.locals['3in1Vaccination'] = _.get(req.session.data, `3-in-1-vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
    res.locals.menACWYVaccination = _.get(req.session.data, `men-acwy-vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)
    res.locals.vaccination = _.get(req.session.data, `vaccination.${req.params.sessionId}.${req.params.nhsNumber}`)

    if (!res.locals.vaccination.batch) {
      res.locals.vaccination.batch = req.session.data['todays-batch']
    }

    next()
  })

  router.get([
    '/vaccination/:sessionId/:nhsNumber',
    '/3-in-1-vaccination/:sessionId/:nhsNumber',
    '/men-acwy-vaccination/:sessionId/:nhsNumber'
  ], (req, res) => {
    res.render('vaccination/index')
  })

  router.get([
    '/vaccination/:sessionId/:nhsNumber/:view',
    '/3-in-1-vaccination/:sessionId/:nhsNumber/:view',
    '/men-acwy-vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res) => {
    res.render(`vaccination/${req.params.view}`)
  })

  router.post([
    '/vaccination/:sessionId/:nhsNumber/details'
  ], (req, res, next) => {
    const { patient, vaccination } = res.locals
    const { batch, outcome, notes } = vaccination
    const vaccineGiven =
      (outcome === VACCINATION_OUTCOME.VACCINATED) ||
      (outcome === VACCINATION_OUTCOME.PART_VACCINATED)

    if (vaccineGiven) {
      patient.outcome = PATIENT_OUTCOME.VACCINATED
      patient.batch = batch
      patient.seen = {
        text: PATIENT_OUTCOME.VACCINATED,
        outcome: VACCINATION_OUTCOME.VACCINATED,
        notes
      }
    } else {
      patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      patient.seen = {
        text: PATIENT_OUTCOME.COULD_NOT_VACCINATE,
        outcome: VACCINATION_OUTCOME.REFUSED,
        notes
      }
    }

    res.locals.patient.seen.isOffline = res.locals.isOffline
    next()
  })

  router.post([
    '/vaccination/:sessionId/:nhsNumber',
    '/vaccination/:sessionId/:nhsNumber/:view',
    '/3-in-1-vaccination/:sessionId/:nhsNumber',
    '/3-in-1-vaccination/:sessionId/:nhsNumber/:view',
    '/men-acwy-vaccination/:sessionId/:nhsNumber',
    '/men-acwy-vaccination/:sessionId/:nhsNumber/:view'
  ], (req, res) => {
    // Remove ?referrer from path
    // TODO: Find out which function is appending queries incorrectly
    // Is this an upstream issue in the NHS Prototype Rig?
    const next = res.locals.paths.next
      .replace(/\?referrer=.*/, '')

    res.redirect(next)
  })
}
