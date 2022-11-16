import { wizard } from 'nhsuk-prototype-rig'

export function fluVaccination (req) {
  const nhsNumber = req.params.nhsNumber
  const journey = {
    [`/campaign/patient/${nhsNumber}`]: {},
    [`/flu-vaccination/${nhsNumber}`]: {},
    [`/flu-vaccination/${nhsNumber}/has-it-been-given`]: {
      [`/flu-vaccination/${nhsNumber}/details`]: {
        data: `flu-vaccination.${nhsNumber}.given`,
        excludedValue: 'No'
      }
    },
    [`/flu-vaccination/${nhsNumber}/not-given`]: {},
    [`/flu-vaccination/${nhsNumber}/details`]: {},
    [`/flu-vaccination/${nhsNumber}/confirmation`]: {
      [`/campaign/patient/${nhsNumber}`]: true
    },
    '/campaign/flu': {}
  }

  return wizard(journey, req)
}
