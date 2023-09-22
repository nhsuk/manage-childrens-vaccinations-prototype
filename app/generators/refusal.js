import { faker } from '@faker-js/faker'
import { REFUSAL_REASON } from '../enums.js'

export default (type) => {
  let availableReasons = Object.values(REFUSAL_REASON)
  if (type !== 'Flu') {
    availableReasons = availableReasons.filter(a => {
      return a !== REFUSAL_REASON.GELATINE
    })
  }

  const reason = faker.helpers.arrayElement(availableReasons)

  let reasonDetails
  if (reason === REFUSAL_REASON.OTHER) {
    reasonDetails = 'My family rejects vaccinations on principle.'
  }

  return { reason, reasonDetails }
}
