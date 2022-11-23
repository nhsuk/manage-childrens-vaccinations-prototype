import fs from 'fs'

export const person = (faker, isChild, lastName) => {
  const boysNames = fs.readFileSync('app/generators/boys-names.txt').toString().split('\n')
  const girlsNames = fs.readFileSync('app/generators/girls-names.txt').toString().split('\n')
  const sex = faker.helpers.arrayElement(['Male', 'Female'])
  let firstName

  if (sex === 'Male' && isChild) {
    firstName = faker.helpers.arrayElement(boysNames)
  }

  if (sex === 'Female' && isChild) {
    firstName = faker.helpers.arrayElement(girlsNames)
  }

  if (!isChild) {
    firstName = faker.name.firstName(sex)
  }

  lastName = lastName || faker.name.lastName(sex)
  const fullName = `${firstName} ${lastName}`

  return {
    sex,
    firstName,
    lastName,
    fullName
  }
}
