import fs from 'fs'
const schools = JSON.parse(fs.readFileSync('app/generators/schools_sample.json'))

export const school = (faker) => {
  return faker.helpers.arrayElement(schools)
}
