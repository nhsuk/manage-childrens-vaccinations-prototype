import getPerson from './person.js'

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
  const person = getPerson(faker, false, lastNameToUse)
  const parent = person.sex === 'Female' ? 'Mum' : 'Dad'

  person.telephone = faker.helpers.replaceSymbolWithNumber('07### ######')
  person.relationship = relationship === 'Parent' ? parent : relationship
  person.email = faker.internet.email({
    firstName: person.firstName,
    lastName: person.lastName
  })

  delete person.sex
  return person
}
