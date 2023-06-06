import { faker } from '@faker-js/faker'

export default (campaigns, batches) => {
  const campaign = Object.values(campaigns).find(c => c.inProgress)
  const campaignId = campaign.id
  const children = campaign.children

  let batch = null
  if (campaign.isFlu) {
    batch = Object.values(batches).find(b => b.isFlu)
  } else if (campaign.isHPV) {
    batch = Object.values(batches).find(b => b.isHPV)
  } else if (campaign.is3in1MenACWY) {
    batch = Object.values(batches).find(b => b.isMenACWY || b.is3in1)
  }

  const vr = {
    [campaignId]: {}
  }

  children.filter(c => c.outcome === 'Vaccinated').forEach(child => {
    vr[campaignId][child.nhsNumber] = {
      given: 'Yes',
      where: 'Left arm',
      batch: batch.name
    }
  })

  children.filter(c => c.outcome === 'Could not vaccinate').forEach(child => {
    const reasons = [
      `${child.fullName} was not well enough`,
      `${child.fullName} refused it`,
      `${child.fullName} has already had the vaccine`,
      `${child.fullName} had contraindications`
    ]

    vr[campaignId][child.nhsNumber] = {
      given: 'No',
      'why-not-given': faker.helpers.arrayElement(reasons)
    }
  })

  return vr
}
