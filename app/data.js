import { patients } from './generators/patients.js'

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
  campaign: {
    location: 'St Mary’s Primary School',
    type: 'school',
    patients: patients(100)
  },
  patients: {
    abc: {
      name: 'Emma Marr',
      dob: '2017-01-01',
      consent: 'Parental consent (digital)'
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
    validation: {
      on: false,
      name: 'Form validation',
      description: 'Use form validation when navigating prototype'
    }
  }
}
