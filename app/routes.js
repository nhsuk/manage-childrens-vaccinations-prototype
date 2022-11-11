import express from 'express'
import { recordVaccinationRoutes } from './routes/record-vaccination.js'

const router = express.Router()
recordVaccinationRoutes(router)

export default router
