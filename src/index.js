import http from 'http';
import https from 'https';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { DB } from './s3';
import middleware from './middleware';
import api from './api';
import promMid from 'express-prometheus-middleware';

let config;
if (process.env.CONFIG_PATH) {
  config = require(process.env.CONFIG_PATH)
} else {
  console.log("No custom config provided, using default.")
  config = require('./config.json')
}

const db = new DB(config);

let app = express();

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(middleware({ config, db }));

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

app.use('/', api({ config, db }));

if (config.ssl) {
  const key  = fs.readFileSync(config.sslKey, 'utf8');
  const cert = fs.readFileSync(config.sslCert, 'utf8');
  app.server = https.createServer({ key, cert }, app);
} else {
  app.server = http.createServer(app);
}

app.server.listen(config.port, () => {
  console.log(`Started on port ${app.server.address().port}`);
});
