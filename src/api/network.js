import { Router } from 'express';

export default ({ config, db }) => {
  const router = Router()

  router.get('/', (req, res) => {
    const { query } = req
    if (query.date) {
      db.getNetworkStatsForDate(query.date).then(data => {
        res.json({ ...data })
      })
    } else {
      db.getLatestNetworkStats().then((data) => {
        res.json({ ...data })
      })
    }
  })

  router.get('/dates', (req, res) => {
    db.getAvailableSummaryDates().then(data => {
      res.json(data)
    })
  })

  return router
}
