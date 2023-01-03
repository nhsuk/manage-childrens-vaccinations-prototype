import fs from 'fs'
const schools = JSON.parse(fs.readFileSync('app/generators/schools_sample.json'))

export const school = (faker, type) => {
  let s = faker.helpers.arrayElement(schools)

  if (type === 'Flu') {
    while (s.phase !== 'Primary') {
      s = faker.helpers.arrayElement(schools)
    }
  } else {
    while (s.phase !== 'Secondary') {
      s = faker.helpers.arrayElement(schools)
    }
  }

  return s
}
