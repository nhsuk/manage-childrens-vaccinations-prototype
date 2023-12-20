import participants from '../.data/participants.json' assert { type: 'json' }
import sessions from '../.data/sessions.json' assert { type: 'json' }
import users from '../.data/users.json' assert { type: 'json' }
import vaccines from '../.data/vaccines.json' assert { type: 'json' }
import getVaccination from './fakers/vaccination.js'

export default {
  pilot: { participants },
  support: 'record-childrens-vaccinations@service.nhs.uk',
  sessions,
  user: Object.values(users)[0],
  users,
  vaccines,
  vaccination: getVaccination(sessions, vaccines),
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
