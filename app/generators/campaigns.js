import { campaign } from './campaign.js'
import { campaignInProgress } from './campaign-in-progress.js'
import { DateTime } from 'luxon'

export const campaigns = options => {
  const campaigns = []
  options = options || {}

  for (let i = 0; i < options.count; i++) {
    const c = campaign(options.campaign)
    campaigns.push(c)
  }

  campaigns.push(campaignInProgress(options.campaign))

  return campaigns
    .sort((a, b) => DateTime.fromISO(a.date).valueOf() - DateTime.fromISO(b.date).valueOf())
    .reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})
}
