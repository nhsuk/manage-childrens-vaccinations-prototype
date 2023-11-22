import { newSessionWizard } from '../wizards/new-session.js'
import { isoDateFromDateInput } from '@x-govuk/govuk-prototype-filters/lib/date.js'
import { faker } from '@faker-js/faker'
import vaccines from '../fakers/vaccines.js'
import yearGroups from '../fakers/year-groups.js'

const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

export default (router) => {
  router.all('/sessions/new/start', (req, res) => {
    const sessionId = generateRandomString()
    req.session.data['temp-session'] = { id: sessionId }
    res.redirect(`/sessions/new/${sessionId}`)
  })

  router.all([
    '/sessions/new/:sessionId',
    '/sessions/new/:sessionId/*'
  ], (req, res, next) => {
    res.locals.sessionId = req.params.sessionId
    res.locals.session = req.session.data['temp-session']
    next()
  })

  router.all([
    '/sessions/new/:sessionId',
    '/sessions/new/:sessionId/*'
  ], (req, res, next) => {
    res.locals.paths = newSessionWizard(req)
    next()
  })

  router.post([
    '/sessions/new/:sessionId/check'
  ], (req, res, next) => {
    const tempSession = res.locals.session
    const time = tempSession.time === 'Afternoon' ? '13:00' : '09:00'
    const session = {
      is3in1MenACWY: tempSession.which === '3-in-1 and MenACWY',
      isFlu: tempSession.which === 'Flu',
      isHPV: tempSession.which === 'HPV'
    }

    session.id = tempSession.id
    session.location = tempSession.where
    session.date = `${isoDateFromDateInput(tempSession['session-date'])}T${time}`
    session.type = tempSession.which
    session.cohort = []
    session.title = `${tempSession.which} campaign at ${tempSession.where}`
    session.school = {
      urn: 123456,
      name: tempSession.where
    }

    // TODO: Get vaccines from session data and filter by session type
    session.vaccines = vaccines(faker, session.type)

    // TODO: Get year groups from session data and filter by session type
    session.yearGroups = yearGroups(session.type)

    req.session.data.sessions[session.id] = session
    delete req.session.data['temp-session']

    next()
  })

  router.post([
    '/sessions/new/:sessionId',
    '/sessions/new/:sessionId/*'
  ], (req, res) => {
    res.redirect(res.locals.paths.next)
  })

  router.all([
    '/sessions/new/:sessionId'
  ], (req, res) => {
    res.render('sessions/new/index')
  })

  router.all([
    '/sessions/new/:sessionId/:view'
  ], (req, res) => {
    res.render(`sessions/new/${req.params.view}`)
  })
}
