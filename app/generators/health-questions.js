export const healthQuestions = (faker, type) => {
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

  return enrichWithRealisticAnswers(faker, type, {
    contraindications: false,
    triageNotes: false,
    questions
  })
}

const realisticAnswers = {
  fainting: {
    'anything-else': 'My child has a history of fainting after receiving injections.'
  },
  badExperience: {
    'anything-else': 'My child had a bad experience with a vaccine before, I just want to make sure they are comfortable and safe'
  },
  badReaction: {
    'anything-else': 'My child recently had a bad reaction to a different vaccine. I just want to make sure we are extra cautious with this.'
  },
  surgery: {
    'anything-else': 'Our child recently had surgery and is still recovering. We want to make sure it’s safe for them to get the vaccine.'
  },
  asthma: {
    'medical-conditions': 'My child was diagnosed with asthma a few months ago and it has been quite challenging for them. They have struggled with breathing difficulties and have needed to use their inhaler several times a day.',
    medication: 'My child takes medication every day to manage their asthma'
  },
  nutAllergy: {
    allergy: 'My child has a severe nut allergy and has had an anaphylactic reaction in the past. This is something that is extremely important to me and my husband. We make sure to always have an EpiPen on hand and have educated our child about their allergy.',
    'medical-conditions': 'My child has a severe nut allergy, which is their only existing medical condition that we are aware of.'
  }
}

const enrichWithRealisticAnswers = (faker, type, health) => {
  const triageNeeded = faker.helpers.maybe(() => true, { probability: 1 })
  if (!triageNeeded) {
    return
  }

  const answer = faker.helpers.objectKey(realisticAnswers)
  health.questions.forEach((q) => {
    if (realisticAnswers[answer][q.id]) {
      q.details = realisticAnswers[answer][q.id]
      q.answer = 'Yes'
      health.contraindications = true
    }
  })

  return health
}
