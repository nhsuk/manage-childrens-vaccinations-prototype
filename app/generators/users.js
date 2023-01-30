import { person } from './person.js'
import { faker } from '@faker-js/faker'

export const users = options => {
  const users = []
  options = options || {}
  for (var i = 0; i < options.count; i++) {
    const p = person(faker)
    p.id = Math.random().toString(36).substr(2, 3).toUpperCase()
    p.email = faker.internet.email(
      p.firstName.toLowerCase(),
      p.lastName.toLowerCase(),
      'sais.nhs.uk').replace('_', '.')

    users.push(p)
  }

  return users
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})
}
