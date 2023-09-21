export default (type) => {
  let questions = []

  const allergy = 'Does the child have any severe allergies that have led to an anaphylactic reaction?'
  const medicalConditions = 'Does the child have any existing medical conditions?'
  const anythingElse = 'Is there anything else we should know?'

  switch (type) {
    case 'Flu':
      questions = {
        asthma: 'Has your child been diagnosed with asthma?',
        asthmaSteroids: 'Has your child taken any oral steroids for their asthma in the last 2 weeks?',
        asthmaAdmitted: 'Has your child been admitted to intensive care for their asthma?',
        recentFluVaccination: 'Has your child had a flu vaccination in the last 5 months?',
        immuneSystem: 'Does your child have a disease or treatment that severely affects their immune system?',
        householdImmuneSystem: 'Is anyone in your household currently having treatment that severely affects their immune system?',
        eggAllergy: 'Has your child ever been admitted to intensive care due an allergic reaction to egg?',
        medicationAllergies: 'Does your child have any allergies to medication?',
        previousReaction: 'Has your child ever had a reaction to previous vaccinations?',
        aspirin: 'Does you child take regular aspirin?'
      }
      break
    case 'HPV':
      questions = {
        allergy,
        medicalConditions,
        medication: 'Does the child take any regular medication?',
        anythingElse
      }
      break
    case '3-in-1 and MenACWY':
      questions = {
        allergy,
        medicalConditions,
        immunosuppressant: 'Does the child take any immunosuppressant medication?',
        anythingElse
      }
      break
  }

  return questions
}
