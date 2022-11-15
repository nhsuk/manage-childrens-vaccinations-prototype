import { wizard } from 'nhsuk-prototype-rig'

export function daySetup (req) {
  const journey = {
    '/dashboard': {},
    '/day-setup/where': {},
    '/day-setup/who': {},
    '/day-setup/what': {},
    '/day-setup/batch': {},
    '/day-setup/check-answers': {}
  }

  return wizard(journey, req)
}
