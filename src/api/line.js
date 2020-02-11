import { Router } from 'express';

const lines = ['801', '802', '803', '804', '805', '806'];

export default ({ config, db }) => {
  const router = Router();

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
      db.getLineStatsForDate(query.date, lineId).then(data=> {
        res.json({ ...data });
      })
    } else {
      db.getLatestLineStats(lineId).then((data) => {
        res.json({ ...data });
      });
    }
  })
  
  router.get('/:lineId/dates', (req, res, next) => {
    db.getAvailableSummaryDates().then(data => {
      res.json(data)
    })
  })

  return router
}
