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

const hasAnyOfflineChanges = (campaigns) => {
  const children = Object.values(campaigns)
    .map(campaign => campaign.children)
    .flat()

  children.forEach(patient => {
    if (patient.seen.isOffline) {
      patient.hadOfflineChanges = true
    }
  })

  return children.some(patient => patient.seen.isOffline)
}

const offlineChangesCount = (campaigns) => {
  const offlineCount = Object.values(campaigns)
    .map(campaign => campaign.children)
    .flat()
    .reduce((count, patient) => count + (patient.seen.isOffline ? 1 : 0), 0)

  return offlineCount
}

router.all('*', (req, res, next) => {
  res.locals.success = req.query.success
  res.locals.isOffline = req.session.data.features.offline.on
  res.locals.hasAnyOfflineChanges = hasAnyOfflineChanges(req.session.data.campaigns)
  res.locals.totalOfflineChangesCount = offlineChangesCount(req.session.data.campaigns)

  next()
})

vaccinationRoutes(router)
daySetupRoutes(router)
newCampaignRoutes(router)
campaignRoutes(router)
userRoutes(router)
onlineOfflineRoutes(router, hasAnyOfflineChanges)
redirects(router)
consent(router)
vaccineBatchRoutes(router)

router.get('/dashboard', (req, res, next) => {
  res.locals.hasAnyOfflineChanges = hasAnyOfflineChanges(req.session.data.campaigns)

  next()
})

router.get('/school-sessions', (req, res, next) => {
  res.locals.hasFluCampaigns = Object
    .values(req.session.data.campaigns)
    .some(campaign => campaign.type === 'Flu')
  res.locals.hasHPVCampaigns = Object
    .values(req.session.data.campaigns)
    .some(campaign => campaign.type === 'HPV')
  res.locals.has3in1Campaigns = Object
    .values(req.session.data.campaigns)
    .some(campaign => campaign.type === '3-in-1 and MenACWY')

  next()
})

export default router
