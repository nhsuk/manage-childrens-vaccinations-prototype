import fs from 'node:fs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import getAddress from './address.js'
import getChild from './child.js'
import getParent from './parent.js'

const schoolData = 'app/fakers/seeds/schools.json'
const schools = JSON.parse(fs.readFileSync(schoolData))

/**
 * @typedef {object} Participant
 * @property {string} id - UUID
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 * @property {string} tel - Phone number
 */

/**
 * Generate pilot participant
 * @returns {Participant} Participant
 */
export default () => {
  const nhsNumber = '999#######'.replace(/#+/g, (m) =>
    faker.string.numeric(m.length)
  )

  const child = getChild(5, 10)
  child.address = getAddress()
  child.nhsNumber = faker.helpers.maybe(() => nhsNumber, { probability: 0.7 })
  child.urn = faker.helpers.arrayElement([100216, 100757, 100961])

  const school = schools.find(
    school => Number(school.urn) === child.urn
  )

  const parent = getParent(child)

  const participant = {
    id: faker.string.uuid(),
    urn: child.urn,
    schoolName: school.name,
    submitted: faker.date.recent({ days: 14 }),
    parent,
    child
  }

  participant.child.address = {
    line1: child.address.split('\n')[0],
    locality: child.address.split('\n')[1],
    postcode: child.address.split('\n')[2]
  }

  return participant
}
