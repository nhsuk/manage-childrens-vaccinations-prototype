import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import _ from 'lodash'
import { faker } from '@faker-js/faker'
import getParticipant from './app/fakers/participant.js'
import schoolsSeed from './app/fakers/seeds/schools.json' assert { type: 'json'}
import getSession from './app/fakers/session.js'
import getSessionInProgress from './app/fakers/session-in-progress.js'
import getUser from './app/fakers/user.js'
import getVaccines from './app/fakers/vaccines.js'

// Participants
const participants = faker.helpers.multiple(getParticipant, { count: 50 })

// Schools
const schools = _.keyBy(schoolsSeed, 'urn')

// Sessions
const sessionsArray = faker.helpers.multiple(getSession, { count: 20 })
sessionsArray.push(getSessionInProgress('Flu'))
sessionsArray.push(getSessionInProgress('HPV'))
const sessions = _.keyBy(_.sortBy(sessionsArray, ['date']), 'id')

// Users
const usersArray = faker.helpers.multiple(getUser, { count: 20 })
const users = _.keyBy(usersArray, 'id')

// Vaccines
const vaccinesArray = getVaccines()
const vaccines = _.keyBy(vaccinesArray, 'id')

const generateDataFile = async (outputPath, data) => {
  try {
    const fileDir = path.join(import.meta.url, '..', path.dirname(outputPath))
    await fs.mkdir(fileURLToPath(fileDir), { recursive: true })
    const fileData = JSON.stringify(data, null, 2)
    await fs.writeFile(outputPath, fileData)
    console.log(`Data file generated: ${outputPath}`)
  } catch (error) {
    console.error(error)
  }
}

generateDataFile('.data/schools.json', schools)
generateDataFile('.data/sessions.json', sessions)
generateDataFile('.data/participants.json', participants)
generateDataFile('.data/users.json', users)
generateDataFile('.data/vaccines.json', vaccines)
