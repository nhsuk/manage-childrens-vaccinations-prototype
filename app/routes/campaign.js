export const campaignRoutes = router => {
  /**
   * Example routes to demonstrate using wizard helper.
   */
  router.all([
    '/campaign/:campaignId',
    '/campaign/:campaignId/*'
  ], (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.params.campaignId]

    res.locals.campaign = campaign
    next()
  })

  router.all([
    '/campaign/:campaignId/patient/:nhsNumber',
    '/campaign/:campaignId/patient/:nhsNumber/*'
  ], (req, res, next) => {
    res.locals.patient = res.locals.campaign.patients.find(p => p.nhsNumber === req.params.nhsNumber)
    next()
  })

  router.all([
    '/campaign/:campaignId'
  ], (req, res) => {
    res.render('campaign/index')
  })

  router.all([
    '/campaign/:campaignId/patient/:nhsNumber'
  ], (req, res) => {
    res.render('campaign/patient')
  })
}
