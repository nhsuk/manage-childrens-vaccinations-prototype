import merge from 'deepmerge'
import { RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'
import getEvent from '../fakers/event.js'
import wizard from '../wizards/consent.js'

const getHealthAnswers = (consent) => {
  const healthAnswers = {}

  // Use detail answer if provided, else return `true`
  for (const key of Object.keys(consent.healthAnswerDetails)) {
    if (consent.healthAnswers?.[key] === 'Yes') {
      healthAnswers[key] = consent.healthAnswerDetails[key] || 'No details provided'
    } else {
      healthAnswers[key] = false
    }
  }

  return healthAnswers
}

export default (router) => {
  /**
   * Provide data to all consent views
   */
  router.all('/consent/:sessionId/:nhsNumber/:view?', (req, res, next) => {
    const { sessionId, nhsNumber } = req.params
    const { sessions, responseId } = req.session.data
    const session = sessions[sessionId]

    res.locals.session = session
    res.locals.patient = session.cohort.find(p => p.nhsNumber === nhsNumber)
    res.locals.paths = wizard(req, res, false)
    res.locals.responseId = responseId || 0
    res.locals.response = req.session.data.response
    res.locals.triage = req.session.data.triage

    const { lastName } = res.locals.patient
    res.locals.exampleParents = {
      a: {
        firstName: 'Anthony',
        lastName,
        fullName: `Anthony ${lastName}`,
        tel: '0117 123 4567',
        relationship: 'Dad'
      },
      b: {
        firstName: 'Laura',
        lastName,
        fullName: `Laura ${lastName}`,
        tel: '0117 987 6543',
        relationship: 'Mum'
      }
    }

    next()
  })

  /**
   * Show consent view
   */
  router.get('/consent/:sessionId/:nhsNumber/:view?', (req, res) => {
    res.render(`consent/${req.params.view || 'index'}`)
  })

  /**
   * Update patient record upon confirming changes
   */
  router.post('/consent/:sessionId/:nhsNumber/confirm', (req, res, next) => {
    const { patient, responseId } = res.locals
    const { response, triage } = req.session.data

    // Update local patient data with response
    const originalResponse = patient.responses[responseId]
    patient.responses[responseId] = merge(originalResponse, response)

    // Add any triage outcome
    if (triage) {
      patient.triage.outcome = triage.outcome
    }

    // If triage completed, set completed boolean
    if (triage?.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE) {
      patient.triage.completed = true
    }

    // Add any triage notes
    if (triage?.note) {
      const { user } = req.session.data
      patient.triage.events.push(getEvent(triage.note, { user }))
    }

    // Delete temporary session data
    delete req.session.data.exampleParent
    delete req.session.data.response
    delete req.session.data.triage

    next()
  })

  /**
   * Update session data during question flow
   */
  router.post('/consent/:sessionId/:nhsNumber/:view?', (req, res) => {
    const { exampleParents, patient, responseId } = res.locals
    const { view } = req.params
    const { exampleParent, response, user } = req.session.data
    const parentOrGuardian = patient.responses[responseId]?.parentOrGuardian

    if (view === 'consent') {
      let name = response.status
      switch (response.status) {
        case RESPONSE_CONSENT.GIVEN:
          name = 'Consent updated to given (by phone)'
          break
        case RESPONSE_CONSENT.FINAL_REFUSAL:
          name = 'Refusal confirmed (by phone)'
          break
        default:
          name = 'No response when contacted'
      }

      response.events = [getEvent(name, { user })]

      if (!parentOrGuardian && response?.gillickCompetent === 'Yes') {
        // Use child as consenting party
        response.parentOrGuardian = {
          relationship: 'Child',
          ...patient
        }
      } else if (!parentOrGuardian) {
        // Use selected (example) parent record as consenting party
        response.parentOrGuardian = exampleParents[exampleParent || 'a']
      } else {
        // Use parent from response as consenting party
        response.parentOrGuardian = parentOrGuardian
      }
    }

    // Use correct format for `response.healthAnswers`
    if (view === 'health-questions') {
      response.healthAnswers = getHealthAnswers(response)
      delete req.session.data.response.healthAnswerDetails
    }

    const { next } = res.locals.paths

    res.redirect(next)
  })
}
