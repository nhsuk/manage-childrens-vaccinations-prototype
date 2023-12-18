import express from 'express'
import getConsentOutcome from './utils/consent-outcome.js'
import getTriageOutcome from './utils/triage-outcome.js'
import getPatientOutcome from './utils/patient-outcome.js'
import accountRoutes from './routes/account.js'
import schoolRoutes from './routes/school.js'
import sessionRoutes from './routes/session.js'
import consentRoutes from './routes/consent.js'
import newSessionRoutes from './routes/new-session.js'
import redirects from './routes/redirects.js'
import onlineOfflineRoutes from './routes/online-offline.js'
import userRoutes from './routes/user.js'
import vaccinationRoutes from './routes/vaccination.js'
import vaccineRoutes from './routes/vaccine.js'

const router = express.Router()

const hasOfflineChanges = (sessions) => {
  const cohort = Object.values(sessions)
    .map(session => session.cohort)
    .flat()

  cohort.forEach(patient => {
    patient.hadOfflineChanges = patient.seen.isOffline
  })

  return cohort.some(patient => patient.seen.isOffline)
}

const offlineChangesCount = (sessions) => {
  const offlineCount = Object.values(sessions)
    .map(session => session.cohort)
    .flat()
    .reduce((count, patient) => count + (patient.seen.isOffline ? 1 : 0), 0)

  return offlineCount
}

const updateConsentOutcomes = (sessions) => {
  Object.values(sessions)
    .map(session => session.cohort)
    .flat()
    .forEach(patient => getConsentOutcome(patient))

  return sessions
}

const updateTriageOutcomes = (sessions) => {
  Object.values(sessions)
    .filter(session => session.triageInProgress)
    .map(session => session.cohort)
    .flat()
    .forEach(patient => getTriageOutcome(patient))

  return sessions
}

const updatePatientOutcomes = (sessions) => {
  Object.values(sessions)
    .map(session => session.cohort)
    .flat()
    .forEach(patient => getPatientOutcome(patient))

  return sessions
}

router.all('*', (req, res, next) => {
  const { sessions, features } = req.session.data
  const consentOutcomes = updateConsentOutcomes(sessions)
  const triageOutcomes = updateTriageOutcomes(consentOutcomes)

  res.locals.success = req.query.success
  res.locals.isOffline = features.offline.on
  res.locals.hasOfflineChanges = hasOfflineChanges(sessions)
  res.locals.offlineChangesCount = offlineChangesCount(sessions)
  res.locals.sessions = updatePatientOutcomes(triageOutcomes)

  next()
})

accountRoutes(router)
schoolRoutes(router)
newSessionRoutes(router)
sessionRoutes(router)
consentRoutes(router)
onlineOfflineRoutes(router, hasOfflineChanges)
redirects(router)
userRoutes(router)
vaccinationRoutes(router)
vaccineRoutes(router)

export default router
