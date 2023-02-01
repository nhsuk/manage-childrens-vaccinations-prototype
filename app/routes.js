import express from 'express'
import { vaccinationRoutes } from './routes/vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { newCampaignRoutes } from './routes/new-campaign.js'
import { campaignRoutes } from './routes/campaign.js'
import { userRoutes } from './routes/user.js'
import { onlineOfflineRoutes } from './routes/online-offline.js'

const router = express.Router()

const hasAnyOfflineChanges = (campaigns) => {
  return Object.values(campaigns)
    .map(c => c.children)
    .flat()
    .some(child => child.seen.isOffline)
}

router.all('*', (req, res, next) => {
  res.locals.success = req.query.success
  res.locals.isOffline = req.session.data.features.offline.on
  res.locals.offlineUploaded = req.session.offlineUploaded
  next()
})

vaccinationRoutes(router)
daySetupRoutes(router)
newCampaignRoutes(router)
campaignRoutes(router)
userRoutes(router)
onlineOfflineRoutes(router, hasAnyOfflineChanges)

router.get('/dashboard', (req, res, next) => {
  res.locals.hasAnyOfflineChanges = hasAnyOfflineChanges(req.session.data.campaigns)
  next()
})

export default router
