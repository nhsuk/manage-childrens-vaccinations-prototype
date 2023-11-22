import { wizard } from 'nhsuk-prototype-rig'

export function newSessionWizard (req) {
  const { sessionId } = req.params
  const journey = {
    '/dashboard': {},
    [`/sessions/new/${sessionId}`]: {},
    [`/sessions/new/${sessionId}/location`]: {},
    [`/sessions/new/${sessionId}/type`]: {},
    [`/sessions/new/${sessionId}/date`]: {},
    [`/sessions/new/${sessionId}/confirm`]: {},
    [`/sessions/${sessionId}?success=1`]: {}
  }

  return wizard(journey, req)
}
