import merge from 'deepmerge'
import { PATIENT_OUTCOME, RESPONSE_CONSENT, TRIAGE_OUTCOME } from '../enums.js'
import getNote from '../generators/note.js'
import { consentWizard } from '../wizards/consent.js'
import { getHealthAnswers } from '../utils/health-answers.js'

export default (router) => {
  /**
   * Provide data to all consent views
   */
  router.all('/consent/:campaignId/:nhsNumber/:id/:view?', (req, res, next) => {
    const { campaignId, nhsNumber } = req.params
    const { campaigns } = req.session.data
    const campaign = campaigns[campaignId]

    res.locals.campaign = campaign
    res.locals.patient = campaign.cohort.find(p => p.nhsNumber === nhsNumber)
    res.locals.paths = consentWizard(req, res)
    console.log('res.locals.paths', res.locals.paths)
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
  router.get('/consent/:campaignId/:nhsNumber/:id/:view?', (req, res) => {
    res.render(`consent/${req.params.view || 'index'}`)
  })

  /**
   * Update patient record upon confirming changes
   */
  router.post('/consent/:campaignId/:nhsNumber/:id/confirm', (req, res, next) => {
    const { patient } = res.locals
    const { id } = req.params
    const { response, triage } = req.session.data

    // Update local patient data with response
    const responseId = (id !== 'gillick') && (id !== 'contact') ? id : 0
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
      patient.triage.notes.push(getNote(triage.note, user))
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
  router.post('/consent/:campaignId/:nhsNumber/:id/:view?', (req, res) => {
    const { exampleParents, patient } = res.locals
    const { id, view } = req.params
    const { exampleParent, response, user } = req.session.data

    if (view === 'assessment') {
      // Use child as consenting party
      response.parentOrGuardian = {
        relationship: 'Child',
        ...patient
      }
    }

    console.log('response', response)

    if (view === 'confirm') {
      let name

      // If not gillick competent, mark no response and could not vaccinate
      if (response.gillickCompetent === 'No') {
        name = 'Gillick assessment carried out'
        response.status = RESPONSE_CONSENT.NO_RESPONSE
        patient.outcome = PATIENT_OUTCOME.COULD_NOT_VACCINATE
      } else {
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
      }

      response.events = [{ name, date: new Date(), user }]

      console.log('hi')
      if (id === 'contact') {
        // Use selected (example) parent record as consenting party
        response.parentOrGuardian = exampleParents[exampleParent || 'a']
      } else {
        // Use parent from response as consenting party
        response.parentOrGuardian = patient.responses[id]?.parentOrGuardian
      }
    }

    // Use correct format for `response.healthAnswers`
    if (view === 'health-questions') {
      response.healthAnswers = getHealthAnswers(response)
      delete req.session.data.response.healthAnswerDetails
    }

    // Remove ?referrer from path
    // TODO: Find out which function is appending queries incorrectly
    // Is this an upstream issue in the NHS Prototype Rig?
    const next = res.locals.paths.next.replace(/\?referrer=.*/, '')

    res.redirect(next)
  })
}
