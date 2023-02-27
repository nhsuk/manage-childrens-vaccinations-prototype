import campaign from './campaign.js'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'
import { CONSENT, OUTCOME } from '../enums.js'

const setOutcome = (child, consent) => {
  if (consent === CONSENT.REFUSED || consent === CONSENT.UNKNOWN) {
    child.outcome = OUTCOME.NO_CONSENT
  }

  if (consent === CONSENT.GIVEN) {
    const couldNotVaccinate = faker.helpers.maybe(() => OUTCOME.COULD_NOT_VACCINATE, { probability: 0.2 })
    child.outcome = couldNotVaccinate || OUTCOME.VACCINATED
  }
}

export default (options) => {
  const c = campaign(options)

  c.inProgress = true
  c.date = DateTime.now().toISODate() + 'T' + '09:00'

  _.sampleSize(c.children, 50).forEach(child => {
    setOutcome(child, child.consent[c.type])
  })

  return c
}
