import { wizard } from 'nhsuk-prototype-rig'

export function recordVaccination (req) {
  const journey = {
    '/vaccination/start': {},
    '/vaccination/event': {},
    '/vaccination/given': {
      '/vaccination/event-details': {
        data: 'vaccination.given',
        excludedValue: 'No'
      }
    },
    '/vaccination/not-given': {},
    '/vaccination/event-details': {},
    '/vaccination/confirmation': {}
  }

  return wizard(journey, req)
}
