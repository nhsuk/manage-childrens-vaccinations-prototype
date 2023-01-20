import express from 'express'
import { vaccinationRoutes } from './routes/vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { campaignRoutes } from './routes/campaign.js'

const router = express.Router()

router.all('*', (req, res, next) => {
  const features = req.session.data.features
  res.locals.success = !!req.query.success
  res.locals.isOffline = features.showOfflineFeatures.on && features.offline.on
  next()
})

vaccinationRoutes(router)
daySetupRoutes(router)
campaignRoutes(router)

router.get('/dashboard', (req, res, next) => {
  const anyOffline = Object.values(req.session.data.campaigns)
    .map(c => c.patients)
    .flat()
    .some(patient => patient.seen.isOffline)

  res.locals.hasAnyOfflineChanges = anyOffline
  next()
})

router.get('/go-offline', (req, res) => {
  req.session.data.features.offline.on = true
  res.redirect('back')
})

router.get('/go-online', (req, res) => {
  req.session.data.features.offline.on = false
  res.redirect('back')
})

export default router
