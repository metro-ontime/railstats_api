import resource from 'resource-router-middleware';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'history',

	/** GET / - List all entities */
	index({ params }, res) {
    db.getNetworkHistory().then((data) => {
      res.json({ ...data });
    })
	},
});

