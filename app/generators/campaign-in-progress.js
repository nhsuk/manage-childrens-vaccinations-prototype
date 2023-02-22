import { campaign } from './campaign.js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'

const outcome = (consent) => {
  if (consent === 'Refused' || consent === 'Unknown') {
    return 'No consent'
  }

  if (consent === 'Given') {
    const couldNotVaccinate = faker.helpers.maybe(() => 'Could not vaccinate', { probability: 0.2 })
    return couldNotVaccinate || 'Vaccinated'
  }
}

export const campaignInProgress = (options) => {
  const c = campaign(options)

  c.inProgress = true
  c.date = DateTime.now().toISODate() + 'T' + '09:00'

  _.sampleSize(c.children, 50).forEach(child => {
    child.outcome = outcome(child.consent[c.type])
  })

  return c
}
