import { faker } from '@faker-js/faker'

export const vaccinationRecord = (campaigns) => {
  const campaign = Object.values(campaigns).find(c => c.inProgress)
  const campaignId = campaign.id
  const children = campaign.children

  const vr = {
    [campaignId]: {}
  }

  children.filter(c => c.outcome === 'Vaccinated').forEach(child => {
    vr[campaignId][child.nhsNumber] = {
      given: 'Yes',
      where: 'Left arm'
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
