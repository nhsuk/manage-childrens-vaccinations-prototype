const GIVEN = 'Given'
const REFUSED = 'Refused'
const UNKNOWN = 'Unknown'

export default (faker, type) => {
  if (type === '3-in-1 and MenACWY') {
    const yes = {
      '3-in-1': GIVEN,
      'men-acwy': GIVEN,
      both: true,
      consented: true,
      text: GIVEN,
      responded: true
    }
    const no = {
      '3-in-1': REFUSED,
      'men-acwy': REFUSED,
      refusedBoth: true,
      refused: true,
      text: REFUSED,
      responded: true
    }
    const unknown = {
      '3-in-1': UNKNOWN,
      'men-acwy': UNKNOWN,
      unknown: true,
      text: UNKNOWN,
      responded: false
    }

    return faker.helpers.arrayElement(
      [
        yes,
        yes,
        yes,
        yes,
        yes,
        { '3-in-1': REFUSED, 'men-acwy': GIVEN, text: 'Only MenACWY', responded: true, consented: true },
        { '3-in-1': GIVEN, 'men-acwy': REFUSED, text: 'Only 3-in-1', responded: true, consented: true },
        unknown,
        unknown,
        unknown,
        no,
        no
      ]
    )
  }

  const r = faker.helpers.arrayElement([GIVEN, GIVEN, GIVEN, GIVEN, UNKNOWN, UNKNOWN, UNKNOWN, REFUSED])
  return {
    [type]: r,
    refused: r === REFUSED,
    consented: r === GIVEN,
    responded: r !== UNKNOWN
  }
}
