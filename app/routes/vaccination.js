import { vaccination } from '../wizards/vaccination.js'
import _ from 'lodash'

export const vaccinationRoutes = router => {
  router.all([
    '/3-in-1-vaccination/:campaignId/',
    '/3-in-1-vaccination/:campaignId/:nhsNumber',
    '/3-in-1-vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.type = '3-in-1'
    res.locals.dataLocation = '3-in-1-vaccination'
    res.locals.is3in1 = true
    next()
  })

  router.all([
    '/men-acwy-vaccination/:campaignId/',
    '/men-acwy-vaccination/:campaignId/:nhsNumber',
    '/men-acwy-vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.type = 'MenACWY'
    res.locals.dataLocation = 'men-acwy-vaccination'
    res.locals.isMenACWY = true
    next()
  })

  router.all([
    '/vaccination/:campaignId/',
    '/vaccination/:campaignId/:nhsNumber',
    '/vaccination/:campaignId/:nhsNumber/:view',
    '/3-in-1-vaccination/:campaignId/',
    '/3-in-1-vaccination/:campaignId/:nhsNumber',
    '/3-in-1-vaccination/:campaignId/:nhsNumber/:view',
    '/men-acwy-vaccination/:campaignId/',
    '/men-acwy-vaccination/:campaignId/:nhsNumber',
    '/men-acwy-vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.patient = campaign.patients.find(p => p.nhsNumber === req.params.nhsNumber)
    res.locals.paths = vaccination(req)
    next()
  })

  router.all([
    '/vaccination/:campaignId/',
    '/vaccination/:campaignId/:nhsNumber',
    '/vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.vaccinationRecord = _.get(req.session.data, `vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    next()
  })

  router.all([
    '/vaccination/:campaignId/:nhsNumber/details'
  ], (req, res, next) => {
    res.locals.isMultipleVaccines = res.locals.patient.consent.both
    res.locals.isSingleVaccine = !res.locals.isMultipleVaccines
    res.locals['3in1VaccinationRecord'] = _.get(req.session.data, `3-in-1-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    res.locals.menACWYVaccinationRecord = _.get(req.session.data, `men-acwy-vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    res.locals.vaccinationRecord = res.locals['3in1VaccinationRecord'] || res.locals.menACWYVaccinationRecord || _.get(req.session.data, `vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    next()
  })

  router.get([
    '/vaccination/:campaignId/:nhsNumber',
    '/3-in-1-vaccination/:campaignId/:nhsNumber',
    '/men-acwy-vaccination/:campaignId/:nhsNumber'
  ], (req, res) => {
    res.render('vaccination/index')
  })

  router.get([
    '/vaccination/:campaignId/:nhsNumber/:view',
    '/3-in-1-vaccination/:campaignId/:nhsNumber/:view',
    '/men-acwy-vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res) => {
    res.render(`vaccination/${req.params.view}`)
  })

  router.post([
    '/vaccination/:campaignId/:nhsNumber/details'
  ], (req, res, next) => {
    const vaccineGiven = res.locals.vaccinationRecord.given !== 'No'

    if (vaccineGiven) {
      res.locals.patient.seen = { text: 'Vaccinated' }
    } else {
      res.locals.patient.seen = { text: 'Vaccine not given', classes: 'nhsuk-tag--yellow' }
    }

    next()
  })

  router.post([
    '/vaccination/:campaignId/:nhsNumber',
    '/vaccination/:campaignId/:nhsNumber/:view',
    '/3-in-1-vaccination/:campaignId/:nhsNumber',
    '/3-in-1-vaccination/:campaignId/:nhsNumber/:view',
    '/men-acwy-vaccination/:campaignId/:nhsNumber',
    '/men-acwy-vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
