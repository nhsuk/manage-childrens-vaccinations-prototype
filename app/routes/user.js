import { faker } from '@faker-js/faker'

export default (router) => {
  router.all([
    '/users/:userId',
    '/users/:userId/*'
  ], (req, res, next) => {
    const data = req.session.data
    const user = data.users[req.params.userId]
    res.locals.user = user
    next()
  })

  router.get('/users/new/', (req, res) => {
    res.render('users/new')
  })

  router.post('/users/new/', (req, res) => {
    const userId = faker.string.uuid()

    req.session.data.users[userId] = {
      id: userId,
      ...req.session.data.users.new
    }

    delete req.session.data.users.new

    res.redirect('/users?success=invited')
  })

  router.all('/users/:userId/', (req, res) => {
    res.render('users/user')
  })

  router.all('/users/:userId/:view', (req, res) => {
    res.render(`users/${req.params.view}`)
  })
}
