import resource from 'resource-router-middleware';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'dates',

	/** GET / - List all entities */
	index({}, res) {
    db.getAvailableSummaryDates().then(data => {
      res.json(data)
    })
	},
});


