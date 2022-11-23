import express from 'express'
import { vaccinationRoutes } from './routes/vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { campaignRoutes } from './routes/campaign.js'

const router = express.Router()
vaccinationRoutes(router)
daySetupRoutes(router)
campaignRoutes(router)

export default router
