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

  router.get([
    '/user/new/'
  ], (req, res) => {
    res.render('user/new')
  })

  router.post([
    '/user/new/'
  ], (req, res) => {
    req.session.data.users['123'] = req.session.data.users.new
    delete req.session.data.users.new
    res.redirect('/manage-users?success=invited')
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
