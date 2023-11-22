import { newSessionWizard } from '../wizards/new-session.js'
import { isoDateFromDateInput } from '@x-govuk/govuk-prototype-filters/lib/date.js'
import { faker } from '@faker-js/faker'
import { generateRandomString } from '../utils/string.js'
import vaccines from '../fakers/vaccines.js'
import yearGroups from '../fakers/year-groups.js'

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

  router.get('/sessions/new/:sessionId/:view?', (req, res) => {
    const view = req.params.view || 'index'

    res.render(`sessions/new/${view}`)
  })

  router.post([
    '/sessions/new/:sessionId/confirm'
  ], (req, res, next) => {
    const { session } = res.locals
    const time = session.time === 'Afternoon' ? '13:00' : '09:00'

    session.date = `${isoDateFromDateInput(session.date)}T${time}`
    session.cohort = []
    session.title = `${session.type} campaign at ${session.location}`
    session.school = {
      urn: 123456,
      name: session.location
    }
    session.is3in1MenACWY = session.type === '3-in-1 and MenACWY'
    session.isFlu = session.type === 'Flu'
    session.isHPV = session.type === 'HPV'

    // TODO: Get vaccines from session data and filter by session type
    session.vaccines = vaccines(faker, session.type)

    // TODO: Get year groups from session data and filter by session type
    session.yearGroups = yearGroups(session.type)

    req.session.data.sessions[session.id] = session
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
