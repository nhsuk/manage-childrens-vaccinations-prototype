import fs from 'node:fs'
import { faker } from '@faker-js/faker'

const schoolData = 'app/fakers/seeds/schools.json'
const schools = JSON.parse(fs.readFileSync(schoolData))

/**
 * Generate school
 * @param {string} [type] - Campaign type
 * @returns {object} School
 */
export default (type) => {
  let school = faker.helpers.arrayElement(schools)

  if (type === 'Flu') {
    const primarySchools = schools.filter(item => item.phase === 'Primary')
    school = faker.helpers.arrayElement(primarySchools)
  } else {
    const secondarySchools = schools.filter(item => item.phase === 'Secondary')
    school = faker.helpers.arrayElement(secondarySchools)
  }

  return school
}
