export const address = (faker) => {
  const postcode = `BS${faker.random.numeric(2)} ${faker.random.numeric(1)}${faker.random.alpha(2)}`.toUpperCase()
  return `${faker.random.numeric(3)} ${faker.address.street()}<br>Bristol<br>${postcode}`
}
