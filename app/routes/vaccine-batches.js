const sortByExpiryDate = (batches) => {
  return batches.sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate)
  })
}

export default (router) => {
  router.get('/vaccines', (req, res, next) => {
    const batches = Object.values(req.session.data.vaccines.batches)
    res.locals.batches = sortByExpiryDate(batches)
    next()
  })

  router.get('/vaccines/:batchNumber', (req, res) => {
    res.locals.batch = req.session.data.vaccines.batches[req.params.batchNumber]
    res.render('vaccines/batch')
  })
}
