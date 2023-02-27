export const consent = (faker, type) => {
  if (type === '3-in-1 and MenACWY') {
    const yes = { '3-in-1': 'Given', 'men-acwy': 'Given', both: true, text: 'Given', responded: true }
    const no = { '3-in-1': 'Refused', 'men-acwy': 'Refused', refusedBoth: true, text: 'Refused', responded: true }
    const unknown = { '3-in-1': 'Unknown', 'men-acwy': 'Unknown', unknown: true, text: 'Unknown', responded: false }

    return faker.helpers.arrayElement(
      [
        yes,
        yes,
        yes,
        yes,
        yes,
        { '3-in-1': 'Refused', 'men-acwy': 'Given', text: 'Only MenACWY', responded: true },
        { '3-in-1': 'Given', 'men-acwy': 'Refused', text: 'Only 3-in-1', responded: true },
        unknown,
        unknown,
        unknown,
        no,
        no
      ]
    )
  }

  const r = faker.helpers.arrayElement(['Given', 'Given', 'Given', 'Given', 'Unknown', 'Unknown', 'Unknown', 'Refused'])
  return {
    [type]: r,
    responded: r !== 'Unknown'
  }
}
