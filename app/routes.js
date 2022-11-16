import express from 'express'
import { fluVaccinationRoutes } from './routes/flu-vaccination.js'
import { daySetupRoutes } from './routes/day-setup.js'
import { campaignRoutes } from './routes/campaign.js'

const router = express.Router()
fluVaccinationRoutes(router)
daySetupRoutes(router)
campaignRoutes(router)

export default router
