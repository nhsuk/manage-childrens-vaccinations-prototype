export const person = (faker, lastName) => {
  const sex = faker.helpers.arrayElement(['Male', 'Female'])
  const firstName = faker.name.firstName(sex)
  lastName = lastName || faker.name.lastName(sex)
  const fullName = `${firstName} ${lastName}`

  return {
    sex,
    firstName,
    lastName,
    fullName
  }
}
