import { person } from './person.js'

export const parentOrGuardian = (faker, lastName) => {
  const relationship = faker.helpers.arrayElement(['Parent', 'Parent', 'Parent', 'Parent', 'Parent', 'Parent', 'Parent', 'Parent', 'Parent', 'Guardian', 'Carer'])

  // Do not match name if guardian or carer
  // 3 out of 4 parents with same surname as child
  const lastNameToUse = relationship === 'Parent' ? faker.helpers.arrayElement([lastName, lastName, lastName, false]) : false

  const p = person(faker, lastNameToUse)
  p.telephone = faker.phone.number('07#########')
  p.relationship = relationship
  p.email = faker.internet.email(p.firstName, p.lastName)

  return p
}