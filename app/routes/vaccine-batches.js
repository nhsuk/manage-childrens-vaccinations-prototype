export default (router) => {
  router.get('/vaccines/:batchNumber', (req, res) => {
    res.locals.batch = req.session.data.vaccines.batches[req.params.batchNumber]
    res.render('vaccines/batch')
  })
}
