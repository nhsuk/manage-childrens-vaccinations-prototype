import fs from 'node:fs/promises'
import path from 'node:path'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'
import getCampaign from './app/fakers/campaign.js'
import getCampaignInProgress from './app/fakers/campaign-in-progress.js'
import getUser from './app/fakers/user.js'
import getVaccines from './app/fakers/vaccines.js'

// Create campaigns, with one in progress
const campaignsArray = faker.helpers.multiple(getCampaign, { count: 20 })

// Add in progress campaigns
campaignsArray.push(getCampaignInProgress('Flu'))
campaignsArray.push(getCampaignInProgress('HPV'))

// Sort campaigns by date
campaignsArray.sort((a, b) =>
  DateTime.fromISO(a.date).valueOf() - DateTime.fromISO(b.date).valueOf()
)
const campaigns = _.keyBy(campaignsArray, 'id')

const usersArray = faker.helpers.multiple(getUser, { count: 20 })
const users = _.keyBy(usersArray, 'id')

const vaccines = getVaccines()

const generateDataFile = async (outputPath, data) => {
  try {
    const fileDir = path.dirname(outputPath)
    await fs.mkdir(fileDir, { recursive: true })
    const fileData = JSON.stringify(data, null, 2)
    await fs.writeFile(outputPath, fileData)
    console.log(`Data file generated: ${outputPath}`)
  } catch (error) {
    console.error(error)
  }
}

generateDataFile('./.data/campaigns.json', campaigns)
generateDataFile('./.data/users.json', users)
generateDataFile('./.data/vaccines.json', vaccines)
