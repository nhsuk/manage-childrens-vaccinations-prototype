export const onlineOfflineRoutes = (router, hasAnyOfflineChanges) => {
  router.get('/go-offline', (req, res) => {
    req.session.offlineUploaded = false
    req.session.data.features.offline.on = true
    res.redirect('back')
  })

  router.get('/dismiss-upload', (req, res, next) => {
    req.session.offlineUploaded = false
    res.redirect('back')
  })

  router.get('/go-online', (req, res) => {
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
    res.redirect('back')
  })
}
