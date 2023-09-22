import _ from 'lodash'
import { DateTime } from 'luxon'
import { CONSENT } from '../enums.js'
import getConsent from './consent.js'
import getRefusal from './refusal.js'
import getHealthAnswers from './health-answers.js'
import getParent from './parent.js'

export default (faker, { type, child, count }) => {
  const consentResponses = []

  for (let i = 0; i < count; i++) {
    const consent = getConsent(type)
    const { reason, reasonDetails } = getRefusal(type)
    const days = faker.number.int({ min: 10, max: 35 })
    const method = faker.helpers.arrayElement([
      ...Array(5).fill('Website'),
      'Text message',
      'Telephone',
      'In person',
      'Paper'
    ])

    consentResponses.push({
      [type]: consent,
      date: DateTime.local().minus({ days }).toISODate(),
      method,
      parentOrGuardian: getParent(faker, child.lastName),
      healthAnswers: (consent === CONSENT.GIVEN)
        ? getHealthAnswers(faker, type, child)
        : false,
      ...(consent === CONSENT.REFUSED) && {
        reason,
        ...reasonDetails && { reasonDetails }
      }
    })
  }

  return _.uniqBy(consentResponses, 'parentOrGuardian.relationship')
}
