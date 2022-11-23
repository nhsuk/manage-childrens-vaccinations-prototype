import { vaccination } from '../wizards/vaccination.js'
import _ from 'lodash'

export const vaccinationRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/vaccination/:campaignId/',
    '/vaccination/:campaignId/:nhsNumber',
    '/vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    res.locals.patient = campaign.patients.find(p => p.nhsNumber === req.params.nhsNumber)
    res.locals.vaccinationRecord = _.get(data, `vaccination.${req.params.campaignId}.${req.params.nhsNumber}`)
    res.locals.paths = vaccination(req)
    next()
  })

  router.get('/vaccination/:campaignId/:nhsNumber', (req, res) => {
    res.render('vaccination/index')
  })

  router.get('/vaccination/:campaignId/:nhsNumber/:view', (req, res) => {
    res.render(`vaccination/${req.params.view}`)
  })

  router.post([
    '/vaccination/:campaignId/:nhsNumber/details'
  ], (req, res, next) => {
    const vaccineGiven = res.locals.vaccinationRecord.given !== 'No'

    if (vaccineGiven) {
      res.locals.patient.seen = { text: 'Vaccinated', classes: 'nhsuk-tag--green' }
    } else {
      res.locals.patient.seen = { text: 'Vaccine not given', classes: 'nhsuk-tag--yellow' }
    }

    next()
  })

  router.post([
    '/vaccination/:campaignId/:nhsNumber',
    '/vaccination/:campaignId/:nhsNumber/:view'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
