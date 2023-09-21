import { CONSENT } from '../enums.js'

export default (type, consentResponses) => {
  const consentResponse = consentResponses[0][type]

  return {
    [type]: consentResponse,
    text: consentResponse,
    refused: consentResponse === CONSENT.REFUSED,
    consented: consentResponse === CONSENT.GIVEN,
    responded: consentResponse !== CONSENT.UNKNOWN,
    answersNeedTriage: consentResponse.answersNeedTriage
  }
}
