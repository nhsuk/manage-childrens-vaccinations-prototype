import { createRequire } from 'node:module'

import getVaccination from './fakers/vaccination.js'

const require = createRequire(import.meta.url)
const participants = require('../.data/participants.json')
const sessions = require('../.data/sessions.json')
const users = require('../.data/users.json')
const vaccines = require('../.data/vaccines.json')

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
