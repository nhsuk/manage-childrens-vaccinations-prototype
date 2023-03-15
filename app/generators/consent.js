import { CONSENT } from '../enums.js'

export default (faker, type) => {
  if (type === '3-in-1 and MenACWY') {
    const yes = {
      '3-in-1': CONSENT.GIVEN,
      'men-acwy': CONSENT.GIVEN,
      text: CONSENT.GIVEN,
      both: true,
      consented: true,
      responded: true
    }
    const no = {
      '3-in-1': CONSENT.REFUSED,
      'men-acwy': CONSENT.REFUSED,
      text: CONSENT.REFUSED,
      refusedBoth: true,
      refused: true,
      responded: true
    }
    const unknown = {
      '3-in-1': CONSENT.UNKNOWN,
      'men-acwy': CONSENT.UNKNOWN,
      text: CONSENT.UNKNOWN,
      unknown: true,
      responded: false
    }

    return faker.helpers.arrayElement(
      [
        ...Array(5).fill(yes),
        { '3-in-1': CONSENT.REFUSED, 'men-acwy': CONSENT.GIVEN, text: CONSENT.ONLY_MENACWY, responded: true, consented: true },
        { '3-in-1': CONSENT.GIVEN, 'men-acwy': CONSENT.REFUSED, text: CONSENT.ONLY_3_IN_1, responded: true, consented: true },
        ...Array(5).fill(unknown),
        ...Array(2).fill(no)
      ]
    )
  }

  const r = faker.helpers.arrayElement([
    ...Array(10).fill(CONSENT.GIVEN),
    ...Array(5).fill(CONSENT.UNKNOWN),
    CONSENT.REFUSED
  ])

  return {
    [type]: r,
    text: r,
    refused: r === CONSENT.REFUSED,
    consented: r === CONSENT.GIVEN,
    responded: r !== CONSENT.UNKNOWN
  }
}
