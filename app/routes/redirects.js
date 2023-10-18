const getCampaignId = (req) => {
  return Object.keys(req.session.data.campaigns)[0]
}

export default (router) => {
  router.get('/go/record', (req, res) => {
    res.redirect(`/campaign/${getCampaignId(req)}/record`)
  })

  router.get('/go/triage', (req, res) => {
    res.redirect(`/campaign/${getCampaignId(req)}/triage`)
  })

  router.get('/go/in-progress', (req, res) => {
    const campaignId = Object.values(req.session.data.campaigns)
      .find(campaign => campaign.inProgress).id
    res.redirect(`/campaign/${campaignId}/record`)
  })

  router.get('/go/in-progress-triage', (req, res) => {
    const campaignId = Object.values(req.session.data.campaigns)
      .filter(campaign => campaign.triageInProgress)[0].id
    res.redirect(`/campaign/${campaignId}/triage`)
  })
}
