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
    res.redirect('/dashboard')
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
}
