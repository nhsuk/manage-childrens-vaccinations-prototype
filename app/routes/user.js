export const userRoutes = router => {
  router.all([
    '/user/:userId',
    '/user/:userId/*'
  ], (req, res, next) => {
    const data = req.session.data
    const user = data.users[req.params.userId]
    res.locals.user = user
    next()
  })

  router.all([
    '/user/:userId/'
  ], (req, res) => {
    res.render('user/index')
  })

  router.all([
    '/user/:userId/:view'
  ], (req, res) => {
    res.render(`user/${req.params.view}`)
  })
}
