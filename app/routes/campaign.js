export const campaignRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/campaign',
    '/campaign/*'
  ], (req, res, next) => {
    next()
  })

  router.all([
    '/campaign/patient/:nhsNumber',
    '/campaign/patient/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.patient = req.session.data.campaign.patients.find(p => p.nhsNumber === req.params.nhsNumber)
    next()
  })

  router.all([
    '/campaign/patient/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/patient')
  })
}
