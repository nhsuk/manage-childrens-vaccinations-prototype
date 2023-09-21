import getCampaigns from './generators/campaigns.js'
import getVaccinationRecord from './generators/vaccination-record.js'
import getTriageRecord from './generators/triage-record.js'
import getUsers from './generators/users.js'
import getVaccines from './generators/vaccines.js'

/**
 * Default values for user session data
 *
 * These are automatically added via the `autoStoreData` middleware. A values
 * will only be added to the session if it doesn't already exist. This may be
 * useful for testing journeys where users are returning or logging in to an
 * existing application.
 */

const campaigns = getCampaigns({ count: 20 })
const vaccines = getVaccines()

export default {
  support: 'record-childrens-vaccinations@service.nhs.uk',
  user: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com'
  },
  campaigns,
  vaccines,
  vaccination: getVaccinationRecord(campaigns, vaccines.batches),
  triage: getTriageRecord(campaigns),
  users: getUsers({ count: 20 }),
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
