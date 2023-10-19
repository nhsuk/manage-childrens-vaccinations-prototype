import { RESPONSE_CONSENT } from '../enums.js'
import getNote from '../generators/note.js'
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
  router.all('/consent/:campaignId/:nhsNumber/:view?', (req, res, next) => {
    const { campaignId, nhsNumber } = req.params
    const { campaigns, responseId } = req.session.data
    const campaign = campaigns[campaignId]

    res.locals.campaign = campaign
    res.locals.patient = campaign.cohort.find(p => p.nhsNumber === nhsNumber)
    res.locals.paths = wizard(req, res, false)
    res.locals.responseId = responseId || 0
    res.locals.response = req.session.data.response
    res.locals.triage = req.session.data.triage

    next()
  })

  /**
   * Show consent view
   */
  router.get('/consent/:campaignId/:nhsNumber/:view?', (req, res) => {
    res.render(`consent/${req.params.view || 'index'}`)
  })

  /**
   * Update patient record upon confirming changes
   */
  router.post('/consent/:campaignId/:nhsNumber/confirm', (req, res, next) => {
    const { patient, responseId } = res.locals
    const { response, triage } = req.session.data

    // Add response to local patient data
    if (response.status !== RESPONSE_CONSENT.INVALID) {
      patient.responses[responseId] = response
    }

    // Add any consent notes
    if (response?.note) {
      patient.consent.notes.push(getNote(response.note, true))
    }

    // Add any triage notes
    if (triage?.note) {
      patient.triage.notes.push(getNote(triage.note))
    }

    // Add any triage outcome
    if (triage) {
      patient.triage.outcome = triage.outcome
    }

    // Delete temporary session data
    delete req.session.data.response
    delete req.session.data.triage

    next()
  })

  /**
   * Update session data during question flow
   */
  router.post('/consent/:campaignId/:nhsNumber/:view?', (req, res) => {
    const { patient, responseId } = res.locals
    const { view } = req.params
    const { response } = req.session.data
    const parentOrGuardian = patient.responses[responseId]?.parentOrGuardian

    req.session.data.response = {
      date: new Date(),
      method: 'Phone',
      ...response
    }

    // Use existing parent or guardian information when checking refusal
    if (view === 'consent' && parentOrGuardian) {
      req.session.data.response.parentOrGuardian = parentOrGuardian
    }

    // Use correct format for `response.healthAnswers`
    if (view === 'health-questions') {
      req.session.data.response.healthAnswers = getHealthAnswers(response)
      delete req.session.data.response.healthAnswerDetails
    }

    res.redirect(res.locals.paths.next)
  })
}
