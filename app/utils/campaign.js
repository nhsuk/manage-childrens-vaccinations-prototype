/**
 * Get health questions used to triage patients in a campaign
 * @param {string} type - Campaign type
 * @returns {object} Health questions
 */
export const healthQuestions = (type) => {
  const allergy = 'Does your child have any severe allergies?'
  const medicalConditions = 'Does your child have any medical conditions for which they receive treatment?'
  const previousReaction = 'Has your child ever had a severe reaction to any medicines, including vaccines?'
  const anythingElse = 'Is there anything else we should know?'

  switch (type) {
    case 'Flu':
      return {
        asthma: 'Has your child been diagnosed with asthma?',
        asthmaSteroids: 'Has your child taken any oral steroids for their asthma in the last 2 weeks?',
        asthmaAdmitted: 'Has your child been admitted to intensive care for their asthma?',
        recentFluVaccination: 'Has your child had a flu vaccination in the last 5 months?',
        immuneSystem: 'Does your child have a disease or treatment that severely affects their immune system?',
        householdImmuneSystem: 'Is anyone in your household currently having treatment that severely affects their immune system?',
        eggAllergy: 'Has your child ever been admitted to intensive care due an allergic reaction to egg?',
        medicationAllergies: 'Does your child have any allergies to medication?',
        previousReaction,
        aspirin: 'Does your child take regular aspirin?'
      }
    case 'HPV':
      return {
        allergy,
        medicalConditions,
        previousReaction
      }
    case '3-in-1 and MenACWY':
      return {
        allergy,
        medicalConditions,
        immunosuppressant: 'Does the child take any immunosuppressant medication?',
        anythingElse
      }
    default:
      return {}
  }
}

/**
 * Get vaccines used in a campaign
 * @param {string} type - Campaign type
 * @returns {Array} Vaccines
 */
export const vaccines = (type) => {
  switch (type) {
    case 'Flu':
      return [
        // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1107978/Influenza-green-book-chapter19-16September22.pdf
        {
          type: 'Flu',
          vaccine: 'Flu',
          brand: 'Fluenz Tetra',
          method: 'Nasal spray',
          isFlu: true
        },
        {
          type: 'Flu',
          vaccine: 'Flu',
          brand: 'Fluarix Tetra',
          method: 'Injection',
          isFlu: true
        }
      ]
    case 'HPV':
      return [
        // Possible others: Gardasil, Cervarix
        // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1065283/HPV-greenbook-chapter-18a.pdf
        {
          type: 'HPV',
          vaccine: 'HPV',
          brand: 'Gardasil 9',
          method: 'Injection',
          isHPV: true
        }
      ]
    case '3-in-1 and MenACWY':
      return [
        // Possible others: Pediacel, Repevax, Infanrix IPV
        // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/147952/Green-Book-Chapter-15.pdf
        {
          type: '3-in-1 and MenACWY',
          vaccine: '3-in-1',
          brand: 'Revaxis',
          method: 'Injection',
          is3in1: true
        },
        // Menveo, Nimenrix and MenQuadfi
        // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1076053/Meningococcal-greenbook-chapter-22_17May2022.pdf
        {
          type: '3-in-1 and MenACWY',
          vaccine: 'MenACWY',
          brand: 'Nimenrix',
          method: 'Injection',
          isMenACWY: true
        }
      ]
    default:
      return []
  }
}

/**
 * Get year groups vaccinated in a campaign
 * @param {string} type - Campaign type
 * @returns {Array} Year groups
 */
export const yearGroups = (type) => {
  switch (type) {
    case 'Flu':
      return [
        { name: 'Reception', number: 0 },
        { name: 'Year 1', number: 1 },
        { name: 'Year 2', number: 2 },
        { name: 'Year 3', number: 3 },
        { name: 'Year 4', number: 4 },
        { name: 'Year 5', number: 5 },
        { name: 'Year 6', number: 6 }
      ]
    case 'HPV':
      return [
        { name: 'Year 8', number: 8 },
        { name: 'Year 9', number: 9 }
      ]
    case '3-in-1 and MenACWY':
      return [
        { name: 'Year 9', number: 9 },
        { name: 'Year 10', number: 10 }
      ]
    default:
      return []
  }
}
