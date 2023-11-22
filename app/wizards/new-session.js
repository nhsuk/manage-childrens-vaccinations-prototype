import { wizard } from 'nhsuk-prototype-rig'

export function newSessionWizard (req) {
  const { sessionId } = req.params
  const journey = {
    '/dashboard': {},
    [`/sessions/new/${sessionId}`]: {},
    [`/sessions/new/${sessionId}/where`]: {},
    [`/sessions/new/${sessionId}/which`]: {},
    [`/sessions/new/${sessionId}/when`]: {},
    [`/sessions/new/${sessionId}/check`]: {},
    [`/sessions/${sessionId}?success=1`]: {}
  }

  return wizard(journey, req)
}
