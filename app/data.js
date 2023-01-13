import { campaigns } from './generators/campaigns.js'

/**
 * Default values for user session data
 *
 * These are automatically added via the `autoStoreData` middleware. A values
 * will only be added to the session if it doesn't already exist. This may be
 * useful for testing journeys where users are returning or logging in to an
 * existing application.
 */
export default {
  user: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com'
  },
  campaigns: campaigns({ count: 20 }),
  vaccines: {
    fluSpray: {
      type: 'flu',
      brand: 'Fluenz Tetra',
      method: 'Nasal spray',
      batch: 'P100475581',
      summary: 'Flu (Fluenz Tetra, P100475581)'
    }
  },
  // Set feature flags using the `features` key
  features: {
    offline: {
      on: false,
      name: 'Go offline',
      description: 'Simulate being offline'
    },
    showOfflineFeatures: {
      on: true,
      name: 'Display offline features',
      description: 'Hide and show features that relate to being online or offline'
    },
    validation: {
      on: false,
      name: 'Form validation',
      description: 'Use form validation when navigating prototype'
    }
  }
}
