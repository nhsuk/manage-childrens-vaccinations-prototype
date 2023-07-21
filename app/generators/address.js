export default (faker) => {
  const postcode = `BS${faker.string.numeric(2)} ${faker.string.numeric(1)}${faker.string.alpha(2)}`.toUpperCase()
  return `${faker.string.numeric(3)} ${faker.location.street()}<br>Bristol<br>${postcode}`
}
