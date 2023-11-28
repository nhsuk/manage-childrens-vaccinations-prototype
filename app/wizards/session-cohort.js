import { wizard } from 'nhsuk-prototype-rig'

export function sessionCohortWizard (req) {
  const { sessionId } = req.params
  const journey = {
    [`/sessions/${sessionId}`]: {},
    [`/sessions/${sessionId}/cohort/upload`]: {},
    [`/sessions/${sessionId}/cohort/confirm`]: {},
    [`/sessions/${sessionId}?success=1`]: {}
  }

  return wizard(journey, req)
}
