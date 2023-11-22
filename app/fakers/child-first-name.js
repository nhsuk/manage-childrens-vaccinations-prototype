import fs from 'node:fs'

const boysNamesData = 'app/fakers/seeds/boys-names.txt'
const boysNames = fs.readFileSync(boysNamesData)
const girlsNamesData = 'app/fakers/seeds/girls-names.txt'
const girlsNames = fs.readFileSync(girlsNamesData)

/**
 * Generate child’s first name
 * @param {Function} faker - Faker
 * @param {string} sex - Child’s sex
 * @returns {string} Child’s first name
 */
export default (faker, sex) => {
  const names = sex === 'Male' ? boysNames : girlsNames

  const firstNames = names.toString()
    .split('\n')
    .filter(e => String(e).trim())

  return faker.helpers.arrayElement(firstNames)
}
