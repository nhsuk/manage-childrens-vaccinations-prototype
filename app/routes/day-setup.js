import { daySetup } from '../wizards/day-setup.js'

export default (router) => {
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
