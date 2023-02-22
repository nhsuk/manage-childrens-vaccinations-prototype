import { campaign } from './campaign.js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'

const setOutcome = (child, consent) => {
  if (consent === 'Refused' || consent === 'Unknown') {
    child.outcome = 'No consent'
  }

  if (consent === 'Given') {
    const couldNotVaccinate = faker.helpers.maybe(() => 'Could not vaccinate', { probability: 0.2 })
    child.outcome = couldNotVaccinate || 'Vaccinated'
  }
}

export const campaignInProgress = (options) => {
  const c = campaign(options)

  c.inProgress = true
  c.date = DateTime.now().toISODate() + 'T' + '09:00'

  _.sampleSize(c.children, 50).forEach(child => {
    setOutcome(child, child.consent[c.type])
  })

  return c
}
