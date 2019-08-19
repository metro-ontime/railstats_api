import resource from 'resource-router-middleware';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'network',

	/** GET / - List all entities */
	index({ query }, res) {
    if (query.date) {
      db.getNetworkStatsForDate(query.date).then(data => {
        res.json({ ...data })
      })
    } else {
      db.getLatestNetworkStats().then((data) => {
        res.json({ ...data })
      })
    }
	},
});

