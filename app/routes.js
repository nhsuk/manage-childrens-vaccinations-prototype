import express from 'express'
import getConsentOutcome from './utils/consent-outcome.js'
import getTriageOutcome from './utils/triage-outcome.js'
import getPatientOutcome from './utils/patient-outcome.js'
import accountRoutes from './routes/account.js'
import campaignRoutes from './routes/campaign.js'
import consentRoutes from './routes/consent.js'
import daySetupRoutes from './routes/day-setup.js'
import newCampaignRoutes from './routes/new-campaign.js'
import redirects from './routes/redirects.js'
import onlineOfflineRoutes from './routes/online-offline.js'
import userRoutes from './routes/user.js'
import vaccinationRoutes from './routes/vaccination.js'
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

const updateConsentOutcomes = (campaigns) => {
  Object.values(campaigns)
    .map(campaign => campaign.cohort)
    .flat()
    .forEach(patient => getConsentOutcome(patient))

  return campaigns
}

const updateTriageOutcomes = (campaigns) => {
  Object.values(campaigns)
    .filter(campaign => campaign.triageInProgress)
    .map(campaign => campaign.cohort)
    .flat()
    .forEach(patient => getTriageOutcome(patient))

  return campaigns
}

const updatePatientOutcomes = (campaigns) => {
  Object.values(campaigns)
    .map(campaign => campaign.cohort)
    .flat()
    .forEach(patient => getPatientOutcome(patient))

  return campaigns
}

router.all('*', (req, res, next) => {
  const { campaigns, features } = req.session.data
  const consentOutcomes = updateConsentOutcomes(campaigns)
  const triageOutcomes = updateTriageOutcomes(consentOutcomes)

  res.locals.success = req.query.success
  res.locals.isOffline = features.offline.on
  res.locals.hasOfflineChanges = hasOfflineChanges(campaigns)
  res.locals.offlineChangesCount = offlineChangesCount(campaigns)
  res.locals.campaigns = updatePatientOutcomes(triageOutcomes)

  next()
})

accountRoutes(router)
newCampaignRoutes(router)
campaignRoutes(router)
consentRoutes(router)
daySetupRoutes(router)
onlineOfflineRoutes(router, hasOfflineChanges)
redirects(router)
userRoutes(router)
vaccinationRoutes(router)
vaccineBatchRoutes(router)

export default router
