const getSessionId = (req) => {
  return Object.keys(req.session.data.sessions)[0]
}

export default (router) => {
  router.get('/go/record', (req, res) => {
    res.redirect(`/sessions/${getSessionId(req)}/record`)
  })

  router.get('/go/triage', (req, res) => {
    res.redirect(`/sessions/${getSessionId(req)}/triage`)
  })

  router.get('/go/in-progress', (req, res) => {
    const sessionId = Object.values(req.session.data.sessions)
      .find(session => session.inProgress).id
    res.redirect(`/sessions/${sessionId}/record`)
  })

  router.get('/go/in-progress-triage', (req, res) => {
    const sessionId = Object.values(req.session.data.sessions)
      .filter(session => session.triageInProgress)[0].id
    res.redirect(`/sessions/${sessionId}/triage`)
  })
}
