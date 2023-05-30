import campaigns from './generators/campaigns.js'
import vaccinationRecord from './generators/vaccination-record.js'
import triageRecord from './generators/triage-record.js'
import users from './generators/users.js'
import vaccines from './generators/vaccines.js'

/**
 * Default values for user session data
 *
 * These are automatically added via the `autoStoreData` middleware. A values
 * will only be added to the session if it doesn't already exist. This may be
 * useful for testing journeys where users are returning or logging in to an
 * existing application.
 */

const c = campaigns({ count: 20 })

export default {
  support: 'record-childrens-vaccinations@service.nhs.uk',
  user: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com'
  },
  campaigns: c,
  vaccines: vaccines(),
  vaccination: vaccinationRecord(c),
  triage: triageRecord(c),
  users: users({ count: 20 }),
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
