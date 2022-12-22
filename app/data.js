import { patients } from './generators/patients.js'
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
  campaigns_old: {
    flu: {
      id: 'flu',
      title: 'Flu campaign at St Mary’s Primary School',
      location: 'St Mary’s Primary School',
      type: 'flu',
      vaccine: {
        brand: 'Fluenz Tetra',
        method: 'Nasal spray',
        batch: 'P100475581',
        summary: 'Flu (Fluenz Tetra, P100475581)'
      },
      patients: patients({ count: 100, patient: { minAge: 4, maxAge: 11 } })
    },
    hpv: {
      id: 'hpv',
      title: 'HPV campaign at Hele’s Secondary School',
      location: 'Hele’s Secondary School',
      type: 'HPV',
      vaccine: {
        brand: 'Gardasil 9',
        method: 'Injection',
        batch: 'G100475581',
        summary: 'HPV (Gardasil 9, G100475581)'
      },
      patients: patients({ count: 100, patient: { minAge: 12, maxAge: 13 } })
    }
  },
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
      name: 'Offline mode',
      description: 'Simulate offline mode'
    },
    validation: {
      on: false,
      name: 'Form validation',
      description: 'Use form validation when navigating prototype'
    }
  }
}
