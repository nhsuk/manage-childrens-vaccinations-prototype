import _ from 'lodash'
import { sessionCohortWizard } from '../wizards/session-cohort.js'
import getSession from '../fakers/session.js'

export default (router) => {
  router.all('/sessions/:sessionId/cohort/:view', (req, res, next) => {
    res.locals.paths = sessionCohortWizard(req)
    next()
  })

  // Create cohort
  router.get('/sessions/:sessionId/cohort/confirm', (req, res, next) => {
    const { type } = res.locals.session
    let { cohort } = getSession(type)
    cohort = _.shuffle(cohort).slice(0, 27)
    cohort = _.sortBy(cohort, ['firstName'])

    for (const patient of cohort) {
      patient.responses = []
    }

    res.locals.cohort = cohort
    req.session.data.newCohort = cohort

    next()
  })

  router.get('/sessions/:sessionId/cohort/:view', (req, res) => {
    res.render(`sessions/cohort/${req.params.view}`)
  })

  // Save cohort to session
  router.post('/sessions/:sessionId/cohort/confirm', (req, res) => {
    const { sessionId } = req.params

    req.session.data.sessions[sessionId].cohort = req.session.data.newCohort
    delete req.session.data.newCohort

    res.redirect(res.locals.paths.next)
  })

  router.post('/sessions/:sessionId/cohort/:view', (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
