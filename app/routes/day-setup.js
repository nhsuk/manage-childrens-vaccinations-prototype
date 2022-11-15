import { daySetup } from '../wizards/day-setup.js'

export const daySetupRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/day-setup',
    '/day-setup/:view'
  ], (req, res, next) => {
    res.locals.paths = daySetup(req)
    next()
  })

  router.post('/day-setup/:view', (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
