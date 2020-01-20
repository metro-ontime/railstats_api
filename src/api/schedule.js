import resource from 'resource-router-middleware';

var fs = require('fs');

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'schedule',

	/** GET / - List all entities */
	index({ query }, res) {
    if (query.date) {
      db.getLineScheduleForDate(query.date)
      .then(stream => {
        stream.pipe(res)
      })
    } else {
      db.getLatestSchedule()
      .then((stream) => {
        stream.pipe(res)
      })
    }
	},
});
