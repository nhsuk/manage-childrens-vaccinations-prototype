import _ from 'lodash'

export default (router) => {
  router.get('/vaccines', (req, res, next) => {
    const { vaccines } = req.session.data

    res.locals.vaccines = _.sortBy(vaccines, ['brand'])

    next()
  })

  router.get('/vaccines/:vaccineId/:batchId', (req, res) => {
    const { batchId, vaccineId } = req.params
    const { vaccines } = req.session.data
    const vaccine = vaccines[vaccineId]

    res.locals.vaccine = vaccine
    res.locals.batch = vaccine.batches[batchId]
    res.render('vaccines/batch')
  })
}
