// This is an AWS lambda function to invalidate Cloudflare CDN caching
// of this API's responses. We set up a trigger to watch the railstats-la
// S3 bucket, triggering this function every time an object is updated.
const https = require('https');

const endpointsByType = {
  summaries: [
    "network",
    "line/801",
    "line/802",
    "line/803",
    "line/804",
    "line/805",
    "line/806"
  ],
  schedule: [ "schedule" ],
  tracking: [ "tracking" ]
}

const baseUrl = "https://apiv2.railstats.org";

function generatePaths(objectKey) {
  const regex = /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
  const match = regex.exec(objectKey);
  const date = match[0];
  const prefix = objectKey.split('/')[0];
  const endpoints = endpointsByType[prefix];
  const paths = endpoints.map(ep => [`${baseUrl}/${ep}`, `${baseUrl}/${ep}?date=${date}`]).flat();
  return paths
}

exports.handler = async (event) => {

  const objectKey = event.Records[0].s3.object.key;
  const files = generatePaths(objectKey);
  const data = JSON.stringify({ files });

  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
      'X-Auth-Key': process.env.CLOUDFLARE_AUTH_KEY
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(`Cache invalidated for ${data}`);
      res.on('data', (d) => {
        process.stdout.write(d)
        resolve()
      })
    })

    req.on('error', (error) => {
      console.error(error)
      reject()
    })

    req.write(data)
    req.end()
  })
}
