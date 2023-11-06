export default (router) => {
  router.get('/account/sign-out', (req, res) => {
    delete req.session.data.token
    res.redirect('/')
  })
}
