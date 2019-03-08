import resource from 'resource-router-middleware';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'network',

	/** GET / - List all entities */
	index({ params }, res) {
    db.getLatestNetworkStats().then((data) => {
      res.json({ "data": data });
    })
	},
});

