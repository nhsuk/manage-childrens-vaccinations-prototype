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
    triage: false,
    questions
  })
}

const realisticAnswers = {
  fainting: {
    'anything-else': 'My child has a history of fainting after receiving injections.',
    triage: 'I have spoken to the parent and gathered that the child has a history of fainting after receiving injections. It is recommended to observe the child for 15 minutes after the vaccine is given, to monitor for any adverse reactions. The vaccine can be safely given with this precaution in place.'
  },
  badExperience: {
    'anything-else': 'My child had a bad experience with a vaccine before, I just want to make sure they are comfortable and safe',
    triage: 'I have spoken to the parent and they mentioned that the child had a bad experience with a vaccine before. It is important to ensure the child is comfortable and at ease during the vaccine process. I suggest discussing any concerns with the child and addressing them before proceeding with the vaccine. It is safe to give the vaccine with these measures in place.'
  },
  badReaction: {
    'anything-else': 'My child recently had a bad reaction to a different vaccine. I just want to make sure we are extra cautious with this.',
    triage: 'Spoke with parent, confirmed bad reaction from previous vaccine. Vaccine was a COVID-19 vaccination and the reaction was swelling at the site of vaccination. Safe to vaccinate with caution. Monitor for adverse reactions post-vaccination.'
  },
  surgery: {
    'anything-else': 'Our child recently had surgery and is still recovering. We want to make sure it’s safe for them to get the vaccine.',
    triage: 'Spoke with parent. Child has sufficiently recovered. It is safe to vaccinate'
  },
  asthma: {
    'medical-conditions': 'My child was diagnosed with asthma a few months ago and it has been quite challenging for them. They have truggled with breathing difficulties and have needed to use their inhaler several times a day.',
    medication: 'My child takes medication every day to manage their asthma',
    triage: 'Spoke with parent. Child has asthma, takes daily medication. Safe to give vaccine'
  },
  nutAllergy: {
    allergy: 'My child has a severe nut allergy and has had an anaphylactic reaction in the past. This is something that is extremely important to me and my husband. We make sure to always have an EpiPen on hand and have educated our child about their allergy.',
    'medical-conditions': 'My child has a severe nut allergy, which is their only existing medical condition that we are aware of.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  diabetes: {
    'medical-conditions': 'My child has type 1 diabetes and requires daily insulin injections.',
    medication: 'My child takes insulin injections multiple times a day to manage their diabetes.',
    triage: 'Spoke with parent, it is safe to vaccinate'
  },
  epilepsy: {
    'medical-conditions': 'My child has epilepsy and has seizures on a regular basis.',
    medication: 'My child takes anti-seizure medication twice a day to manage their epilepsy.',
    triage: 'Spoke with parent, it is safe to vaccinate'
  },
  heartCondition: {
    'medical-conditions': 'My child was born with a heart condition and has had several surgeries to repair it.',
    medication: 'My child takes medication to manage their heart condition and prevent further issues.',
    triage: 'Spoke with parent, it is safe to vaccinate'
  },
  foodAllergy: {
    allergy: 'Yes, my child has a food allergy to dairy products and has had an anaphylactic reaction in the past.',
    medication: 'My child carries an EpiPen with them at all times in case of another reaction.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  bleedingDisorder: {
    'medical-conditions': 'My child has a bleeding disorder and can easily bruise or bleed.',
    medication: 'My child takes medication to manage their bleeding disorder and prevent excessive bleeding.',
    triage: 'Spoke with parent, child has bleeding disorder and takes medication to manage. Vaccinator needs to be aware and cautious when administering vaccine to prevent excessive bleeding.'
  },
  anemia: {
    'medical-conditions': 'My child was diagnosed with anemia and has low iron levels.',
    medication: 'My child takes iron supplements to manage their anemia.',
    triage: 'Spoke with parent, child diagnosed with anemia and takes iron supplements. Vaccinator needs to be aware and ensure iron levels are monitored during and after vaccine administration.'
  },
  adhd: {
    'medical-conditions': 'My child was diagnosed with ADHD and has difficulty focusing and paying attention.',
    medication: 'My child takes medication to manage their ADHD and help with focus and attention.',
    triage: 'Spoke with parent, child diagnosed with ADHD and takes medication. Vaccinator should be aware of child’s condition and accommodate by allowing extra time for the child to settle, using clear communication and providing a calm environment. Monitor for any adverse reactions during and after vaccine administration.'
  },
  celiacDisease: {
    'medical-conditions': 'My child has celiac disease and must follow a strict gluten-free diet.',
    medication: 'My child does not take medication, but follows a strict gluten-free diet to manage their celiac disease.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  migraines: {
    'medical-conditions': 'My child suffers from migraines and has severe headaches on a regular basis.',
    medication: 'My child takes medication to manage their migraines and prevent headaches.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  chronicPain: {
    'medical-conditions': 'My child has chronic pain due to a previous injury and struggles with discomfort daily.',
    medication: 'My child takes pain medication to manage their chronic pain and improve their quality of life.',
    triage: 'Spoke with parent, child has chronic pain due to previous injury and takes medication. Vaccinator should be aware of child’s condition and take extra care during vaccine administration to minimize any discomfort. Monitor for any adverse reactions during and after vaccine administration.'
  },
  eczema: {
    'medical-conditions': 'My child has eczema and has skin irritation and redness on a regular basis.',
    medication: 'My child uses topical ointments to manage their eczema and prevent skin irritation.',
    'anything-else': 'My child also has a history of food allergies that can trigger their eczema.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  chronicIllness: {
    'medical-conditions': 'My child has a chronic illness and requires ongoing medical treatment.',
    immunosuppressant: 'My child takes immunosuppressant medication to manage their chronic illness and prevent complications.',
    'anything-else': 'My child also has a history of hospitalizations due to their chronic illness.'
  },
  asthmaAndAllergies: {
    'medical-conditions': 'My child has asthma and multiple allergies, including environmental and food allergies.',
    medication: 'My child takes medication to manage their asthma and prevent breathing difficulties. They also carry an EpiPen in case of anaphylactic reactions.',
    'anything-else': 'My child has a history of anaphylactic reactions and must avoid certain foods and environments to prevent reactions.',
    triage: 'Spoke with parent. Safe to vaccinate, but monitor for adverse reactions'
  },
  autism: {
    'medical-conditions': 'My child has autism spectrum disorder and has difficulty with social interactions and communication.',
    medication: 'My child does not take medication, but receives therapy to help with their autism.',
    'anything-else': 'My child also has a sensory processing disorder and can be sensitive to certain sounds and textures.',
    triage: 'Spoke with parent, child has autism spectrum disorder and sensory processing disorder. Child does not take medication but receives therapy. Vaccinator should be aware of child’s conditions, especially the sensory processing disorder, and take extra care during vaccine administration to minimize any discomfort. Monitor for any adverse reactions during and after vaccine administration.'
  },
  learningDisability: {
    'medical-conditions': 'My child has a learning disability and has difficulty with reading, writing, and other academic skills.',
    medication: 'My child does not take medication, but receives extra support in school to help with their learning disability.',
    'anything-else': 'My child also struggles with attention and focus, but has made great progress with the help of support services.',
    triage: 'Vaccinator should be aware of the child’s learning disability and provide appropriate support to ensure a smooth vaccination experience'
  },
  anxietyDisorder: {
    'medical-conditions': 'My child has an anxiety disorder and experiences excessive worry and fear on a regular basis.',
    medication: 'My child takes medication to manage their anxiety and prevent panic attacks.',
    'anything-else': 'My child also has a history of sleep disturbances and struggles to fall asleep at night.',
    triage: 'Spoke with parent. Child has an anxiety disorder, takes medication to manage it. No medical issues that would impact vaccine administration. It is safe to vaccinate.'
  },
  depression: {
    'medical-conditions': 'My child has depression and experiences feelings of sadness and hopelessness on a regular basis.',
    medication: 'My child takes medication to manage their depression and improve their mood.',
    'anything-else': 'My child also struggles with low energy and a lack of motivation, but has made progress with the help of therapy and medication.',
    triage: 'Spoke with parent. Child has depression, takes medication to manage it, has made progress with therapy. No medical issues that would impact vaccine administration. It is safe to vaccinate.'
  },
  dyslexia: {
    'medical-conditions': 'My child has dyslexia and has difficulty with reading and writing.',
    medication: 'My child does not take medication, but receives extra support in school to help with their dyslexia.',
    'anything-else': 'My child also has difficulty with spatial awareness and can struggle with activities like sports and games.',
    triage: 'Spoke with parent. Child has dyslexia, does not take medication for it, receives extra support in school. No medical issues that would impact vaccine administration. It is safe to vaccinate.'
  }
}

const enrichWithRealisticAnswers = (faker, type, health) => {
  const triageNeeded = faker.helpers.maybe(() => true, { probability: 0.2 })
  if (!triageNeeded) {
    return health
  }

  const answer = faker.helpers.objectKey(realisticAnswers)
  health.questions.forEach((q) => {
    if (realisticAnswers[answer][q.id]) {
      q.details = realisticAnswers[answer][q.id]
      q.answer = 'Yes'
      health.contraindications = true
      health.triage = realisticAnswers[answer].triage
    }
  })

  return health
}
