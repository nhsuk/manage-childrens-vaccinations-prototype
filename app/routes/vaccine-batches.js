const mapVaccineData = (data) => {
  const map = {}
  data.forEach(vaccine => {
    vaccine.batches.forEach(batch => {
      map[batch.name] = {
        name: batch.name,
        vaccine: vaccine.vaccine,
        brand: vaccine.brand,
        method: vaccine.method,
        expiry: batch.expiry
      }
    })
  })

  return map
}

export default (router) => {
  router.get('/vaccines', (req, res, next) => {
    next()
  })

  router.get('/vaccines/:batchNumber', (req, res) => {
    const batches = mapVaccineData(req.session.data.vaccines)
    res.locals.batch = batches[req.params.batchNumber]

    res.render('vaccines/batch')
  })
}
