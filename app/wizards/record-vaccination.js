import { wizard } from 'nhsuk-prototype-rig'

export function recordVaccination (req) {
  const journey = {
    '/vaccination/start': {},
    '/vaccination/event': {},
    '/vaccination/event-details': {}
  }

  return wizard(journey, req)
}
