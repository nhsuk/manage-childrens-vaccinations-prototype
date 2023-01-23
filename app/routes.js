import express from 'express'
import { vaccinationRoutes } from './routes/vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { campaignRoutes } from './routes/campaign.js'

const router = express.Router()

router.all('*', (req, res, next) => {
  const features = req.session.data.features
  res.locals.success = !!req.query.success
  res.locals.isOffline = features.showOfflineFeatures.on && features.offline.on
  res.locals.offlineUploaded = req.session.offlineUploaded
  next()
})

vaccinationRoutes(router)
daySetupRoutes(router)
campaignRoutes(router)

const hasAnyOfflineChanges = (campaigns) => {
  return Object.values(campaigns)
    .map(c => c.patients)
    .flat()
    .some(patient => patient.seen.isOffline)
}

router.get('/dashboard', (req, res, next) => {
  res.locals.hasAnyOfflineChanges = hasAnyOfflineChanges(req.session.data.campaigns)
  next()
})

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
      .map(c => c.patients)
      .flat()
      .filter(patient => patient.seen.isOffline)
      .forEach(patient => {
        patient.seen.isOffline = false
      })

    req.session.offlineUploaded = true
  }

  req.session.data.features.offline.on = false
  res.redirect('back')
})

export default router
