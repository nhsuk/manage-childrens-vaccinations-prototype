export const healthQuestions = (type) => {
  let questions = []
  const allergy = { id: 'allergy', question: 'Does your child have any severe allergies that have led to an anaphylactic reaction?', answer: 'No' }
  const medicalConditions = { id: 'medical-conditions', question: 'Does your child have any existing medical conditions?', answer: 'No' }

  switch (type) {
    case 'Flu':
      questions = [
        { id: 'their-immune', question: 'Does your child have a disease or treatment that severely affects their immune system?', answer: 'No' },
        { id: 'household-immune', question: 'Is anyone in your household having treatment that severely affects their immune system?', answer: 'No' },
        { id: 'asthma', question: 'Has your child been diagnosed with asthma?', answer: 'No' },
        { id: 'egg-allergy', question: 'Has your child been admitted to intensive care because of a severe egg allergy?', answer: 'No' }
      ]
      break
    case 'HPV':
      questions = [
        allergy,
        medicalConditions,
        { id: 'medication', question: 'Does your child take any regular medication, excluding contraception?', answer: 'No' }
      ]
      break
    case '3-in-1 and MenACWY':
      questions = [
        allergy,
        medicalConditions,
        { id: 'immunosuppressant', question: 'Does your child take any immunosuppressant medication?', answer: 'No' }
      ]
      break
  }

  questions.push({ id: 'anything-else', question: 'Is there anything else you think we should know?', answer: 'No' })

  return {
    contraindications: false,
    triageNotes: false,
    questions
  }
}
