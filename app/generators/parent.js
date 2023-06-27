import person from './person.js'

export default (faker, lastName) => {
  const relationship = faker.helpers.arrayElement([
    ...Array(15).fill('Parent'),
    ...Array(3).fill('Guardian'),
    ...Array(2).fill('Carer'),
    'Step-parent',
    'Grandparent',
    'Teacher'
  ])

  // Do not match name if guardian or carer
  // 3 out of 4 parents with same surname as child
  const lastNameToUse = relationship === 'Parent'
    ? faker.helpers.arrayElement([
      ...Array(3).fill(lastName), false
    ])
    : false
  const p = person(faker, false, lastNameToUse)
  const parent = p.sex === 'Female' ? 'Mum' : 'Dad'

  const queryRelationship = ['Step-parent', 'Grandparent', 'Teacher']
  if (queryRelationship.includes(relationship)) {
    p.queryRelationship = true
  }

  p.telephone = faker.phone.number('07#########')
  p.relationship = relationship === 'Parent' ? parent : relationship
  p.email = faker.internet.email(p.firstName, p.lastName)

  return p
}
