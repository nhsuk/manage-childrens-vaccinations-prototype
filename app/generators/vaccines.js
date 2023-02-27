import { DateTime } from 'luxon'

const getBatches = (faker) => {
  const batches = []
  const count = faker.datatype.number({ min: 1, max: 3 })
  const prefix = faker.random.alpha({ casing: 'upper', count: 2 })

  for (let i = 0; i < count; i++) {
    const name = `${prefix}${faker.phone.number('####')}`
    const daysUntilExpiry = faker.datatype.number({ min: 10, max: 50 })
    const expiry = DateTime.now().plus({ days: daysUntilExpiry }).toISODate()
    batches.push({ name, expiry })
  }

  return batches
}

const summarise = (v) => {
  const brand = v.method === 'Nasal spray' ? v.brand + ' nasal spray' : v.brand
  v.summary = `${v.vaccine} (${brand}, ${v.batches[0].name})`
}

export default (faker, type) => {
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1107978/Influenza-green-book-chapter19-16September22.pdf
  const fluVaccines = [
    {
      vaccine: 'Flu',
      brand: 'Fluenz Tetra',
      method: 'Nasal spray',
      isNasal: true,
      batches: getBatches(faker)
    },
    {
      vaccine: 'Flu',
      brand: 'Fluarix Tetra',
      method: 'Injection',
      batches: getBatches(faker)
    }
  ]
  // Possible others: Gardasil, Cervarix
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1065283/HPV-greenbook-chapter-18a.pdf
  const hpvVaccines = [
    {
      vaccine: 'HPV',
      brand: 'Gardasil 9',
      method: 'Injection',
      batches: getBatches(faker)
    }
  ]

  // Possible others: Pediacel, Repevax, Infanrix IPV
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/147952/Green-Book-Chapter-15.pdf
  const dptVaccines = [
    {
      vaccine: '3-in-1',
      brand: 'Revaxis',
      method: 'Injection',
      batches: getBatches(faker)
    }
  ]

  // Menveo, Nimenrix and MenQuadfi
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1076053/Meningococcal-greenbook-chapter-22_17May2022.pdf
  const menAcwyVaccines = [
    {
      vaccine: 'MenACWY',
      brand: 'Nimenrix',
      method: 'Injection',
      batches: getBatches(faker)
    }
  ]

  let vacs
  switch (type) {
    case 'Flu':
      vacs = fluVaccines
      break
    case 'HPV':
      vacs = hpvVaccines
      break
    case '3-in-1 and MenACWY':
      vacs = dptVaccines.concat(menAcwyVaccines)
      break
  }

  vacs.forEach(vaccine => {
    vaccine.type = type
    summarise(vaccine)
  })

  return vacs
}
