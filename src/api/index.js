import { version } from '../../package.json';
import { Router } from 'express';
import line from './line';
import network from './network';
import history from "./history"

export default ({ config, db }) => {
	let api = Router();

	api.use('/line', line({ config, db }));
	api.use('/network', network({ config, db }));
	api.use('/history', history({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
