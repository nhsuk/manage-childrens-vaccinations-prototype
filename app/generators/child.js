import { person } from './person.js'
import { parent } from './parent.js'
import { address } from './address.js'
import { healthQuestions } from './health-questions.js'
import { DateTime, Interval } from 'luxon'
import { faker } from '@faker-js/faker'
import fs from 'fs'
faker.locale = 'en_GB'

const gp = () => {
  const gpSurgeries = fs.readFileSync('app/generators/data/gp-surgeries.txt')
    .toString()
    .split('\n')
    .filter(e => String(e).trim())

  return faker.helpers.arrayElement(gpSurgeries)
}

const age = (dob) => {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const yearGroupRange = (startYear) => {
  const startDate = DateTime.fromISO(`${startYear}-09-01`)
  const endDate = DateTime.fromISO(`${startYear + 1}-08-31`)
  return {
    start: startDate.toISO(),
    end: endDate.toISO(),
    interval: Interval.fromDateTimes(startDate, endDate)
  }
}

const year0 = 2017
const yearGroups = {}
for (let i = 0; i < 13; i++) {
  yearGroups[i] = yearGroupRange(year0 - i)
}

const yearGroup = (dob) => {
  const dobDate = DateTime.fromJSDate(dob)
  for (const [yearGroup, range] of Object.entries(yearGroups)) {
    if (range.interval.contains(dobDate)) {
      return yearGroup
    }
  }
}

const preferredName = (child) => {
  return `${child.firstName} ${faker.name.lastName()}`
}

const consent = (type) => {
  if (type === '3-in-1 and MenACWY') {
    const yes = { '3-in-1': 'Given', 'men-acwy': 'Given', both: true, text: 'Given', responded: true }
    const no = { '3-in-1': 'Refused', 'men-acwy': 'Refused', refusedBoth: true, text: 'Refused', responded: true }
    const unknown = { '3-in-1': 'Unknown', 'men-acwy': 'Unknown', unknown: true, text: 'Unknown', responded: false }

    return faker.helpers.arrayElement(
      [
        yes,
        yes,
        yes,
        yes,
        yes,
        { '3-in-1': 'Refused', 'men-acwy': 'Given', text: 'Only MenACWY', responded: true },
        { '3-in-1': 'Given', 'men-acwy': 'Refused', text: 'Only 3-in-1', responded: true },
        unknown,
        unknown,
        unknown,
        no,
        no
      ]
    )
  }

  const r = faker.helpers.arrayElement(['Given', 'Given', 'Given', 'Given', 'Unknown', 'Unknown', 'Unknown', 'Refused'])
  return {
    [type]: r,
    responded: r !== 'Unknown'
  }
}

export const child = (options) => {
  const isChild = true
  const c = person(faker, isChild)
  const consentObj = consent(options.type)

  const dob = faker.date.between(
    yearGroups[options.maxYearGroup].start,
    yearGroups[options.minYearGroup].end
  )

  c.preferredName = faker.helpers.maybe(() => preferredName(c), { probability: 0.1 })
  // https://digital.nhs.uk/services/e-referral-service/document-library/synthetic-data-in-live-environments
  c.nhsNumber = faker.phone.number('999#######')
  c.address = address(faker)
  c.gp = gp()
  c.dob = dob
  c.age = age(dob)
  c.yearGroup = yearGroup(dob)
  c.parentOrGuardian = parent(faker, c.lastName)
  c.consent = consentObj
  c.outcome = 'No outcome yet'
  c.seen = {}
  c.healthQuestions = healthQuestions(faker, options.type)

  return c
}
