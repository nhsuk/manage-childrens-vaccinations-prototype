import { faker } from '@faker-js/faker'
import getPerson from './person.js'

export default (options) => {
  const users = []
  options = options || {}
  for (let i = 0; i < options.count; i++) {
    const person = getPerson(faker)
    person.id = Math.random().toString(36).substr(2, 3).toUpperCase()
    person.email = faker.internet.email({
      firstName: person.firstName.toLowerCase(),
      lastName: person.lastName.toLowerCase(),
      provider: 'sais.nhs.uk'
    }).replace('_', '.')

    users.push(person)
  }

  return users
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})
}
