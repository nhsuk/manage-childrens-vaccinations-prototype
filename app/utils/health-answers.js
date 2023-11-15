export const getHealthAnswers = (consent) => {
  const healthAnswers = {}

  // Use detail answer if provided, else return `true`
  for (const key of Object.keys(consent.healthAnswerDetails)) {
    if (consent.healthAnswers?.[key] === 'Yes') {
      healthAnswers[key] = consent.healthAnswerDetails[key] || 'No details provided'
    } else {
      healthAnswers[key] = false
    }
  }

  return healthAnswers
}
