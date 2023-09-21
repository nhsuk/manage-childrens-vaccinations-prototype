import { DateTime } from 'luxon'
import getCampaign from './campaign.js'
import getCampaignInProgress from './campaign-in-progress.js'

export default (options) => {
  const campaigns = []
  options = options || {}

  for (let i = 0; i < options.count; i++) {
    const campaign = getCampaign(options.campaign)
    campaigns.push(campaign)
  }

  campaigns.push(getCampaignInProgress(options.campaign))

  return campaigns
    .sort((a, b) => DateTime.fromISO(a.date).valueOf() - DateTime.fromISO(b.date).valueOf())
    .reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})
}
