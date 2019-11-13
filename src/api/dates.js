import resource from 'resource-router-middleware';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'dates',

	/** GET / - List all entities */
	index({}, res) {
    db.getAvailableDates().then(data => {
      res.json(data)
    })
	},
});


