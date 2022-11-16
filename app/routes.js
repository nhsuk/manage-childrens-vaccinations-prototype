import express from 'express'
import { recordVaccinationRoutes } from './routes/record-vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { campaignRoutes } from './routes/campaign.js'

const router = express.Router()
recordVaccinationRoutes(router)
daySetupRoutes(router)
campaignRoutes(router)

export default router
