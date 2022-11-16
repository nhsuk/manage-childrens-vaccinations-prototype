import { fluVaccination } from '../wizards/flu-vaccination.js'

export const fluVaccinationRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/flu-vaccination',
    '/flu-vaccination/:nhsNumber',
    '/flu-vaccination/:nhsNumber/:view'
  ], (req, res, next) => {
    res.locals.patient = req.session.data.campaign.patients.find(p => p.nhsNumber === req.params.nhsNumber)
    res.locals.paths = fluVaccination(req)
    next()
  })

  router.get('/flu-vaccination/:nhsNumber', (req, res) => {
    res.render('flu-vaccination/index')
  })

  router.get('/flu-vaccination/:nhsNumber/:view', (req, res) => {
    res.render(`flu-vaccination/${req.params.view}`)
  })

  router.post([
    '/flu-vaccination/:nhsNumber',
    '/flu-vaccination/:nhsNumber/:view'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
