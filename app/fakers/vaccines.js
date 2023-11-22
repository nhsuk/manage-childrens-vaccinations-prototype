import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { vaccines } from '../utils/campaign.js'
import getBatch from './batch.js'

const brands = [
  ...vaccines('Flu'),
  ...vaccines('HPV'),
  ...vaccines('3-in-1 and MenACWY')
]

export default () => {
  return brands.map(vaccine => {
    let batches = faker.helpers.multiple(getBatch, { min: 2, max: 5 })
    batches = _.sortBy(batches, ['expiryDate'])
    const brand = vaccine.method === 'Nasal spray'
      ? `${vaccine.brand} nasal spray`
      : vaccine.brand

    return {
      ...{ id: faker.string.numeric(4) },
      ...{ summary: `${vaccine.vaccine} (${brand})` },
      ...vaccine,
      ...{ batches: _.keyBy(batches, 'id') }
    }
  })
}
