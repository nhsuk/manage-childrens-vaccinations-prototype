import { faker } from '@faker-js/faker'
import fs from 'node:fs'

const gpSurgeriesData = 'app/generators/data/gp-surgeries.txt'
const gpSurgeries = fs.readFileSync(gpSurgeriesData)

/**
 * Generate GP surgery
 * @returns {string} GP surgery
 */
export default () => {
  const gps = gpSurgeries.toString()
    .split('\n')
    .filter(e => String(e).trim())

  return faker.helpers.arrayElement(gps)
}
