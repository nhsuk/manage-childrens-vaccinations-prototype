import { faker } from '@faker-js/faker'
import _ from 'lodash'
import getBatch from './batch.js'

const getBatches = () => {
  const batchesArray = faker.helpers.multiple(getBatch, { min: 2, max: 5 })
  const batches = _.keyBy(batchesArray, 'id')

  return batches
}

const summarise = (v) => {
  const brand = v.method === 'Nasal spray' ? v.brand + ' nasal spray' : v.brand
  v.summary = `${v.vaccine} (${brand})`
}

export default () => {
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1107978/Influenza-green-book-chapter19-16September22.pdf
  const fluVaccines = [
    {
      vaccine: 'Flu',
      brand: 'Fluenz Tetra',
      method: 'Nasal spray',
      isFlu: true,
      batches: getBatches()
    },
    {
      vaccine: 'Flu',
      brand: 'Fluarix Tetra',
      method: 'Injection',
      isFlu: true,
      batches: getBatches()
    }
  ]
  // Possible others: Gardasil, Cervarix
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1065283/HPV-greenbook-chapter-18a.pdf
  const hpvVaccines = [
    {
      vaccine: 'HPV',
      brand: 'Gardasil 9',
      method: 'Injection',
      isHPV: true,
      batches: getBatches()
    }
  ]

  // Possible others: Pediacel, Repevax, Infanrix IPV
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/147952/Green-Book-Chapter-15.pdf
  const dptVaccines = [
    {
      vaccine: '3-in-1',
      brand: 'Revaxis',
      method: 'Injection',
      is3in1: true,
      batches: getBatches()
    }
  ]

  // Menveo, Nimenrix and MenQuadfi
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1076053/Meningococcal-greenbook-chapter-22_17May2022.pdf
  const menAcwyVaccines = [
    {
      vaccine: 'MenACWY',
      brand: 'Nimenrix',
      method: 'Injection',
      isMenACWY: true,
      batches: getBatches()
    }
  ]

  const brands = fluVaccines.concat(hpvVaccines, dptVaccines, menAcwyVaccines)
  brands.forEach(vaccine => summarise(vaccine))

  const batches = {}

  brands.flatMap(brand => brand.batches).forEach(brandBatches => {
    Object.keys(brandBatches).forEach(name => {
      const batch = {
        ...brandBatches[name],
        ...brands.find(brand => brand.batches[name])
      }

      batch.summary = batch.summary.replace(')', `, ${name})`)

      delete batch.batches
      batches[name] = batch
    })
  })

  return { batches, brands }
}
