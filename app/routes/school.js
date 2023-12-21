import unmatchedResponses
  from '../../.data/unmatched-responses.json' assert { type: 'json'}

export default (router) => {
  router.all([
    '/schools/:urn',
    '/schools/:urn/*'
  ], (req, res, next) => {
    const { data } = req.session
    const { urn } = req.params
    const school = data.schools[urn]

    const sessions = Object.values(data.sessions)

    school.sessions = sessions.filter(
      session => session.school.urn === urn
    )

    if (school.sessions.length > 0) {
      school.session = school.sessions[0]
      school.cohort = school.sessions[0].cohort
      school.unmatchedResponses = Object.values(unmatchedResponses)
    }

    res.locals.school = school
    next()
  })

  router.all('/schools/:urn/', (req, res) => {
    res.render('schools/school')
  })

  router.all('/schools/:urn/responses/:responseId', (req, res) => {
    const { responseId } = req.params
    const response = res.locals.school.unmatchedResponses.find(
      response => response.id === responseId
    )

    res.locals.response = response
    res.locals.patient = response.child
    res.locals.session = res.locals.school.session

    res.render('schools/response')
  })

  router.all('/schools/:urn/:view', (req, res) => {
    res.render(`schools/${req.params.view}`)
  })
}
