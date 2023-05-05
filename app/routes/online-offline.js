const goOffline = (session) => {
  session.data.features.offline.on = true
}

const goOnline = (req) => {
  req.session.data.features.offline.on = false
}

const syncOfflineChanges = (req) => {
  const campaigns = req.session.data.campaigns
  Object.values(campaigns)
    .map(c => c.children)
    .flat()
    .filter(child => child.seen.isOffline)
    .forEach(child => {
      child.seen.isOffline = false
    })
}

export default (router, hasAnyOfflineChanges) => {
  router.post(['/scenario-office', '/scenario-back-online'], (req, res) => {
    goOnline(req)
    hasAnyOfflineChanges ? res.redirect('/back-online') : res.redirect('/dashboard')
  })

  router.post('/scenario-offline', (req, res) => {
    goOffline(req.session)

    if (req.session.data.hasOfflineCode) {
      res.redirect('/give-offline-code')
    } else {
      res.redirect('/dashboard')
    }
  })

  router.get('/synced-ok', (req, _res, next) => {
    console.log('/synced-ok')
    if (hasAnyOfflineChanges(req)) {
      console.log('hasAnyOfflineChanges')
      syncOfflineChanges(req)
      console.log('syncOfflineChanges done')
    }

    next()
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
    res.redirect(`/campaign/${res.locals.campaignId}`)
  })

  router.post('/give-offline-code', (req, res) => {
    res.redirect('/dashboard')
  })
}
