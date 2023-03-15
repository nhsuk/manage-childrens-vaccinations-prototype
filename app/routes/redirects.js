const getCampaignId = (req) => {
  return Object.keys(req.session.data.campaigns)[0]
}

export default (router) => {
  router.get('/go/record-vaccinations', (req, res) => {
    res.redirect(`/campaign/${getCampaignId(req)}/children`)
  })

  router.get('/go/triage', (req, res) => {
    res.redirect(`/campaign/${getCampaignId(req)}/children-triage`)
  })

  router.get('/go/in-progress', (req, res) => {
    const campaignId = Object.values(req.session.data.campaigns).find(c => c.inProgress).id
    res.redirect(`/campaign/${campaignId}/children`)
  })

  router.get('/go/in-progress-triage', (req, res) => {
    const campaignId = Object.values(req.session.data.campaigns).filter(c => c.triageInProgress)[0].id
    res.redirect(`/campaign/${campaignId}/children-triage`)
  })
}
