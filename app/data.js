import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import getCampaign from './generators/campaign.js'
import getCampaignInProgress from './generators/campaign-in-progress.js'
import getVaccination from './generators/vaccination.js'
import getTriageRecord from './generators/triage-record.js'
import getUser from './generators/user.js'
import getVaccines from './generators/vaccines.js'

/**
 * Default values for user session data
 *
 * These are automatically added via the `autoStoreData` middleware. A values
 * will only be added to the session if it doesn't already exist. This may be
 * useful for testing journeys where users are returning or logging in to an
 * existing application.
 */

// Create campaigns, with one in progress
const campaignsArray = faker.helpers.multiple(getCampaign, { count: 20 })
campaignsArray.push(getCampaignInProgress())

// Sort campaigns by date
campaignsArray.sort((a, b) =>
  DateTime.fromISO(a.date).valueOf() - DateTime.fromISO(b.date).valueOf()
)

// Use object to hold campaigns, with `campaign.id` as key
const campaigns = campaignsArray.reduce((object, campaign) => {
  object[campaign.id] = campaign
  return object
}, {})

const vaccines = getVaccines()
const users = faker.helpers.multiple(getUser, { count: 20 })

export default {
  support: 'record-childrens-vaccinations@service.nhs.uk',
  user: users[0],
  campaigns,
  vaccines,
  vaccination: getVaccination(campaigns, vaccines.batches),
  triage: getTriageRecord(campaigns),
  users,
  // Set feature flags using the `features` key
  features: {
    pilot: {
      on: true,
      name: 'Pilot only',
      description: 'Hide everything not in the pilot'
    },
    offline: {
      on: false,
      name: 'Go offline',
      description: 'Simulate being offline'
    },
    validation: {
      on: false,
      name: 'Form validation',
      description: 'Use form validation when navigating prototype'
    }
  }
}
