import fs from 'fs'

const getChildNames = (sex) => {
  return fs.readFileSync(`app/generators/${sex === 'Female' ? 'girls' : 'boys'}-names.txt`)
    .toString()
    .split('\n')
    .filter(e => String(e).trim())
}

export const person = (faker, isChild, lastName) => {
  const sex = faker.helpers.arrayElement(['Male', 'Female'])
  const firstName = isChild
    ? faker.helpers.arrayElement(getChildNames(sex))
    : faker.name.firstName(sex)

  lastName = lastName || faker.name.lastName(sex)
  const fullName = `${firstName} ${lastName}`

  return {
    sex,
    firstName,
    lastName,
    fullName
  }
}
