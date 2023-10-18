import express from 'express'
import vaccinationRoutes from './routes/vaccination.js'
import daySetupRoutes from './routes/day-setup.js'
import newCampaignRoutes from './routes/new-campaign.js'
import campaignRoutes from './routes/campaign.js'
import userRoutes from './routes/user.js'
import onlineOfflineRoutes from './routes/online-offline.js'
import redirects from './routes/redirects.js'
import consent from './routes/consent.js'
import vaccineBatchRoutes from './routes/vaccine-batches.js'

const router = express.Router()

const hasOfflineChanges = (campaigns) => {
  const cohort = Object.values(campaigns)
    .map(campaign => campaign.cohort)
    .flat()

  cohort.forEach(patient => {
    patient.hadOfflineChanges = patient.seen.isOffline
  })

  return cohort.some(patient => patient.seen.isOffline)
}

const offlineChangesCount = (campaigns) => {
  const offlineCount = Object.values(campaigns)
    .map(campaign => campaign.cohort)
    .flat()
    .reduce((count, patient) => count + (patient.seen.isOffline ? 1 : 0), 0)

  return offlineCount
}

router.all('*', (req, res, next) => {
  const { campaigns, features } = req.session.data

  res.locals.success = req.query.success
  res.locals.isOffline = features.offline.on
  res.locals.hasOfflineChanges = hasOfflineChanges(campaigns)
  res.locals.offlineChangesCount = offlineChangesCount(campaigns)

  next()
})

vaccinationRoutes(router)
daySetupRoutes(router)
newCampaignRoutes(router)
campaignRoutes(router)
userRoutes(router)
onlineOfflineRoutes(router, hasOfflineChanges)
redirects(router)
consent(router)
vaccineBatchRoutes(router)

export default router
