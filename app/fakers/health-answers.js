import fs from 'node:fs'
import { faker } from '@faker-js/faker'
import { healthQuestions } from '../utils/campaign.js'

const healthConditionsData = 'app/fakers/seeds/health-conditions.json'
const healthConditions = JSON.parse(fs.readFileSync(healthConditionsData))

// Save realistic triage note for use later in generation process
const enrichWithRealisticAnswer = (patient, key) => {
  const condition = faker.helpers.objectKey(healthConditions)
  const useAnswer = faker.helpers.maybe(() => true, { probability: 0.2 })

  if (healthConditions[condition][key] && useAnswer) {
    patient.__triageNote = healthConditions[condition].triageNote

    return healthConditions[condition][key]
  }

  return false
}

export default (type, patient) => {
  const answers = {}

  for (const key of Object.keys(healthQuestions(type))) {
    answers[key] = enrichWithRealisticAnswer(patient, key)
  }

  return answers
}
