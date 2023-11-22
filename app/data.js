import { createRequire } from 'node:module'

import getVaccination from './fakers/vaccination.js'

const require = createRequire(import.meta.url)
const campaigns = require('../.data/campaigns.json')
const users = require('../.data/users.json')
const vaccines = require('../.data/vaccines.json')

export default {
  support: 'record-childrens-vaccinations@service.nhs.uk',
  user: Object.values(users)[0],
  campaigns,
  vaccines,
  vaccination: getVaccination(campaigns, vaccines.batches),
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
