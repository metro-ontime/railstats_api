import resource from 'resource-router-middleware';

const lines = ['801', '802', '803', '804', '805', '806'];

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'line',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		let line = lines.find( line => line===id ),
			err = line ? null : { "line": "Not found", "data": {} };
		callback(err, line);
	},

	/** GET / - List all entities */
	index({ params }, res) {
    res.json({ "lines": lines });
	},

	/** GET /:id - Return a given entity */
	read({ line, query }, res) {
    if (query.date) {
      db.getLineStatsForDate(query.date, line).then(data=> {
        res.json({ ...data });
      })
    } else {
      db.getLatestLineStats(line).then((data) => {
        res.json({ ...data });
      });
    }
	},
});
