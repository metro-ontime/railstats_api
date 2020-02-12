import { Router } from 'express';

const lines = ['801', '802', '803', '804', '805', '806'];

export default ({ config, db }) => {
  const router = Router()

  router.get('/', (req, res, next) => {
    res.json({ "lines": lines })
  })

  router.get('/:lineId*', (req, res, next) => {
    const { params: { lineId } } = req
    if (lines.includes(lineId)) {
      next()
    } else {
      res.json({ "error": "Line not found", "data": null })
    }
  })

  router.get('/:lineId', (req, res, next) => {
    const { query, params: { lineId } } = req
    if (query.date) {
      db.getLineScheduleForDate(lineId, query.date)
      .then(stream => {
        stream.pipe(res)
      })
    } else {
      db.getLatestSchedule(lineId)
      .then((stream) => {
        stream.pipe(res)
      })
    }
  })

  router.get('/:lineId/dates', (req, res, next) => {
    const { query, params: { lineId } } = req
    db.getScheduleDates(lineId).then(data => {
      res.json(data)
    })
  })

  return router
}
