import { recordVaccination } from '../wizards/record-vaccination.js'

export const recordVaccinationRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/vaccination',
    '/vaccination/:view'
  ], (req, res, next) => {
    res.locals.paths = recordVaccination(req)
    next()
  })

  router.post('/vaccination/:view', (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
