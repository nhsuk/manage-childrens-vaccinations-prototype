const goOffline = (session) => {
  session.offlineUploaded = false
  session.data.features.offline.on = true
}

const goOnline = (req, hasAnyOfflineChanges) => {
  const campaigns = req.session.data.campaigns
  if (hasAnyOfflineChanges(campaigns)) {
    Object.values(campaigns)
      .map(c => c.children)
      .flat()
      .filter(child => child.seen.isOffline)
      .forEach(child => {
        child.seen.isOffline = false
      })

    req.session.offlineUploaded = true
  }

  req.session.data.features.offline.on = false
}

export const onlineOfflineRoutes = (router, hasAnyOfflineChanges) => {
  router.post(['/scenario-office', '/scenario-back-online'], (req, res) => {
    goOnline(req, hasAnyOfflineChanges)
    res.redirect('/dashboard')
  })

  router.post('/scenario-offline', (req, res) => {
    goOffline(req.session)
    res.redirect('/dashboard')
  })

  router.get('/go-offline', (req, res) => {
    goOffline(req.session)
    res.redirect('back')
  })

  router.get('/dismiss-upload', (req, res) => {
    req.session.offlineUploaded = false
    res.redirect('back')
  })

  router.get('/go-online', (req, res) => {
    goOnline(req, hasAnyOfflineChanges)
    res.redirect('back')
  })
}
