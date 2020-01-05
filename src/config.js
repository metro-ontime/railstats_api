const envVars = [
  {
    key: "PORT",
    type: "int"
  },
  {
    key: "BUCKET",
    type: "string"
  },
  {
    key: "SUMMARY_PREFIX",
    type: "string"
  },
  {
    key: "SCHEDULE_PREFIX",
    type: "string"
  },
  {
    key: "TRACKING_PREFIX",
    type: "string"
  },
  {
    key: "METRO_AGENCY",
    type: "string"
  },
  {
    key: "PUBLIC_BUCKET",
    type: "bool"
  },
  {
    key: "SSL",
    type: "bool"
  },
  {
    key: "SSL_KEY",
    type: "base64"
  },
  {
    key: "SSL_CERT",
    type: "base64"
  }
];

export default class Config {
  constructor() {
    envVars.forEach(envVar => {
      switch (envVar.type) {
        case 'base64':
          this[envVar.key] = Buffer.from(process.env[envVar.key], 'base64').toString('utf-8');
          break;
        case 'bool':
          this[envVar.key] = process.env[envVar.key] === 'true';
          break;
        case 'int':
          this[envVar.key] = parseInt(process.env[envVar.key]);
          break;
        default:
          this[envVar.key] = process.env[envVar.key];
      }
    })
  }
}
