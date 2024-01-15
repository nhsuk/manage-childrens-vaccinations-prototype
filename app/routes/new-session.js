import _ from 'lodash'
import { newSessionWizard } from '../wizards/new-session.js'
import { isoDateFromDateInput } from '@x-govuk/govuk-prototype-filters/lib/date.js'
import { yearGroups } from '../utils/campaign.js'
import { generateRandomString } from '../utils/string.js'
import getSession from '../fakers/session.js'

export default (router) => {
  router.all('/sessions/new/start', (req, res) => {
    const sessionId = generateRandomString()

    req.session.data.newSession = { id: sessionId }
    res.redirect(`/sessions/new/${sessionId}`)
  })

  router.all([
    '/sessions/new/:sessionId',
    '/sessions/new/:sessionId/*'
  ], (req, res, next) => {
    res.locals.sessionId = req.params.sessionId
    res.locals.session = req.session.data.newSession
    res.locals.paths = newSessionWizard(req)
    next()
  })

  router.get('/sessions/new/:sessionId/cohort', (req, res, next) => {
    const { type } = res.locals.session
    let { cohort } = getSession(type)
    cohort = _.shuffle(cohort).slice(0, 27)
    cohort = _.sortBy(cohort, ['lastName'])

    for (const patient of cohort) {
      patient.responses = []
    }

    req.session.data.newCohort = res.locals.cohort = cohort

    next()
  })

  router.get('/sessions/new/:sessionId/confirm', (req, res, next) => {
    res.locals.cohort = req.session.data.newCohort

    next()
  })

  router.get('/sessions/new/:sessionId/:view?', (req, res) => {
    const view = req.params.view || 'index'

    res.render(`sessions/new/${view}`)
  })

  router.post('/sessions/new/:sessionId/confirm', (req, res, next) => {
    const { session } = res.locals
    const { newCohort, vaccines } = req.session.data
    const time = session.time === 'Afternoon' ? '13:00' : '09:00'

    session.date = `${isoDateFromDateInput(session.date)}T${time}`
    session.cohort = newCohort
    session.title = `${session.type} campaign at ${session.location}`
    session.school = {
      urn: 123456,
      name: session.location
    }
    session.is3in1MenACWY = session.type === '3-in-1 and MenACWY'
    session.isFlu = session.type === 'Flu'
    session.isHPV = session.type === 'HPV'
    session.yearGroups = yearGroups(session.type)
    session.vaccines = _.filter(vaccines, { type: session.type })

    req.session.data.sessions[session.id] = session
    delete req.session.data.newCohort
    delete req.session.data.newSession

    next()
  })

  router.post([
    '/sessions/new/:sessionId',
    '/sessions/new/:sessionId/*'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })
}
