import fs from 'node:fs'
import { faker } from '@faker-js/faker'
import getHealthQuestions from './health-questions.js'

const healthConditionsData = 'app/generators/data/health-conditions.json'
const healthConditions = JSON.parse(fs.readFileSync(healthConditionsData))

const enrichWithRealisticAnswers = (patient, answers) => {
  // Do not give health question responses to 80% of children who consent
  if (faker.helpers.maybe(() => true, { probability: 0.8 })) {
    return answers
  }

  const condition = faker.helpers.objectKey(healthConditions)

  for (const key of Object.keys(healthConditions)) {
    if (healthConditions[condition][key]) {
      answers[key] = healthConditions[condition][key]

      // Save realistic triage note for use later in generation process
      patient.__triageNote = healthConditions[condition].triageNote
    }
  }

  return answers
}

export default (type, patient) => {
  const healthQuestions = getHealthQuestions(type)

  const answers = {}

  // Default answer to `false` for most questions
  for (const key of Object.keys(healthQuestions)) {
    answers[key] = false
  }

  // Enrich answers with realistic responses
  const healthAnswers = enrichWithRealisticAnswers(patient, answers)

  return healthAnswers
}
