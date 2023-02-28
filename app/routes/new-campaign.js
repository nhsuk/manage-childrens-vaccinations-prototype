import { newCampaignWizard } from '../wizards/new-campaign.js'
import { isoDateFromDateInput } from 'nhsuk-prototype-rig/lib/filters/date.js'
import { faker } from '@faker-js/faker'
import vaccines from '../generators/vaccines.js'
import yearGroups from '../generators/year-groups.js'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

export default (router) => {
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
    '/campaign/new/:campaignId/check'
  ], (req, res, next) => {
    const tempCampaign = res.locals.campaign
    const time = tempCampaign.time === 'Afternoon' ? '13:00' : '09:00'
    const campaign = {
      is3in1MenACWY: tempCampaign.which === '3-in-1 and MenACWY',
      isFlu: tempCampaign.which === 'Flu',
      isHPV: tempCampaign.which === 'HPV'
    }

    campaign.id = tempCampaign.id
    campaign.location = tempCampaign.where
    campaign.date = `${isoDateFromDateInput(tempCampaign['session-date'])}T${time}`
    campaign.type = tempCampaign.which
    campaign.children = []
    campaign.title = `${tempCampaign.which} campaign at ${tempCampaign.where}`
    campaign.school = {
      urn: 123456,
      name: tempCampaign.where
    }

    campaign.vaccines = vaccines(faker, campaign.type)
    campaign.yearGroups = yearGroups(campaign.type)

    req.session.data.campaigns[campaign.id] = campaign
    delete req.session.data['temp-campaign']

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
