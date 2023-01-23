import { newCampaignWizard } from '../wizards/new-campaign.js'
import { isoDateFromDateInput } from 'nhsuk-prototype-rig/lib/filters/date.js'
import { faker } from '@faker-js/faker'
import { vaccines } from '../generators/vaccines.js'
import { yearGroups } from '../generators/year-groups.js'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

export const newCampaignRoutes = router => {
  router.all('/campaign/new/start', (req, res) => {
    const campaignId = generateRandomString()
    req.session.data['temp-campaign'] = { id: campaignId }
    res.redirect(`/campaign/new/${campaignId}`)
  })

  router.all([
    '/campaign/new/:campaignId',
    '/campaign/new/:campaignId/*'
  ], (req, res, next) => {
    res.locals.campaignId = req.params.campaignId
    res.locals.campaign = req.session.data['temp-campaign']
    next()
  })

  router.all([
    '/campaign/new/:campaignId',
    '/campaign/new/:campaignId/*'
  ], (req, res, next) => {
    res.locals.paths = newCampaignWizard(req)
    next()
  })

  router.post([
    '/campaign/new/:campaignId',
    '/campaign/new/:campaignId/*'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })

  router.all([
    '/campaign/new/:campaignId'
  ], (req, res) => {
    res.render('campaign/new/index')
  })

  router.all([
    '/campaign/new/:campaignId/:view'
  ], (req, res) => {
    res.render(`campaign/new/${req.params.view}`)
  })
}
