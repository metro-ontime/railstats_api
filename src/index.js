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
import Config from './config.js';

const config = new Config();
const db = new DB(config);

let app = express();

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: ["Link"]
}));

app.use(bodyParser.json({
	limit : "100kb"
}));

app.use(middleware({ config, db }));

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

app.use('/', api({ config, db }));

if (config.SSL) {
  const key  = config.SSL_KEY;
  const cert = config.SSL_CERT;
  app.server = https.createServer({ key, cert }, app);
} else {
  app.server = http.createServer(app);
}

app.server.listen(config.PORT, () => {
  console.log(`Started on port ${app.server.address().port}`);
});
