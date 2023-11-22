const goOffline = (req) => {
  req.session.data.features.offline.on = true
}

const goOnline = (req) => {
  req.session.data.features.offline.on = false
}

const syncOfflineChanges = (req) => {
  const { campaigns } = req.session.data

  Object.values(campaigns)
    .map(campaign => campaign.cohort)
    .flat()
    .filter(patient => patient.seen.isOffline)
    .forEach(patient => { patient.seen.isOffline = false })
}

export default (router, hasOfflineChanges) => {
  router.post(['/scenarios/office', '/scenarios/back-online'], (req, res) => {
    goOnline(req)
    hasOfflineChanges ? res.redirect('/back-online') : res.redirect('/dashboard')
  })

  router.post('/scenarios/offline', (req, res) => {
    goOffline(req.session)

    if (req.session.data.hasOfflineCode) {
      res.redirect('/give-offline-code')
    } else {
      res.redirect('/dashboard')
    }
  })

  router.get('/synced-ok', (req, _res, next) => {
    console.log('/synced-ok')
    if (hasOfflineChanges(req)) {
      console.log('hasOfflineChanges')
      syncOfflineChanges(req)
      console.log('syncOfflineChanges done')
    }

    next()
  })

  router.get('/go-offline', (req, res) => {
    goOffline(req)
    res.redirect('back')
  })

  router.get('/go-online', (req, res) => {
    goOnline(req)
    res.redirect('back')
  })

  router.all('/set-offline-code', (req, res, next) => {
    const data = req.session.data
    const campaign = data.campaigns[req.query.campaignId]

    res.locals.campaign = campaign
    res.locals.campaignId = req.query.campaignId
    next()
  })

  router.post('/set-offline-code', (req, res) => {
    req.session.data.hasOfflineCode = true
    res.locals.campaign['available-offline'] = true
    res.redirect(`/sessions/${res.locals.campaignId}`)
  })

  router.post('/give-offline-code', (req, res) => {
    res.redirect('/dashboard')
  })
}
