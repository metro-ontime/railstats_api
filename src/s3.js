import S3 from 'aws-sdk/clients/s3';

export class DB {
  constructor(config) {
    this.s3 = new S3();
    this.bucket = config.bucket;
    this.summary_prefix = config.summary_prefix;
    this.schedule_prefix = config.schedule_prefix;
    this.tracking_prefix = config.tracking_prefix;
    this.metro_agency = config.metro_agency;
    if (config.public_bucket) {
      this.whenListAllObjects = whenListAllObjectsPublic(this.s3);
      this.whenGotS3Object = whenGotS3ObjectPublic(this.s3);
    } else {
      this.whenListAllObjects = whenListAllObjects(this.s3);
      this.whenGotS3Object = whenGotS3Object(this.s3);
    }
  }

  getAvailableSummaryDates = () => {
    const params = { Bucket: this.bucket, Prefix: this.summary_prefix };
    return this.whenListAllObjects(params)
      .then(objects => {
        const regex = /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
        const dates = objects.map(obj => {
          const match = regex.exec(obj);
          return match && match[0];
        }).filter(obj => obj);
        return dates;
      })
  }

  getLatestLineStats = line => {
    const params = { Bucket: this.bucket, Prefix: this.summary_prefix };
    return this.whenListAllObjects(params)
      .then(objects => {
        const mostRecent = objects[objects.length - 1];
        return { Bucket: this.bucket, Key: mostRecent };
      })
      .then(this.whenGotS3Object)
      .then(data => {
        return data[`${line}_${this.metro_agency}`];
      })
  }

  getLineStatsForDate = (date, line) => {
    const params = { Bucket: this.bucket, Key: `${this.summary_prefix}/${this.metro_agency}/${date}.json` };
    return this.whenGotS3Object(params).then(data => {
      return data[`${line}_${this.metro_agency}`];
    }).catch(err => ({ error: `Couldn't get data for line ${line} on date ${date}` }));
  }

  getLatestNetworkStats = () => {}
  prepareNetworkData = () => {}
  getNetworkHistory = () => {}
  getNetworkStatsForDate = () => {}
}

const whenListAllObjectsPublic = s3 => params => {
  return new Promise((resolve, reject) => {
    s3.makeUnauthenticatedRequest('listObjects', params, function (err, data) {
      if (err) reject(err);
      else {
        const objects = data.Contents.map(file => file.Key).sort();
        resolve(objects);
      };
    });
  });
};

const whenListAllObjects = s3 => params => {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, function(err, data) {
      if (err) reject(err);
      else {
        const objects = data.Contents.map(file => file.Key).sort();
        resolve(objects);
      }
    })
  })
}

const whenGotS3ObjectPublic = s3 => params => {
  return new Promise((resolve, reject) => {
    s3.makeUnauthenticatedRequest('getObject', params, function (err, data) {
      if (err) {
        reject({ error: "Could not get S3 Object"})
      } else {
        resolve(JSON.parse(data.Body.toString()));
      };
    });
  });
};

const whenGotS3Object = s3 => params => {
  return new Promise((resolve, reject) => {
    s3.getObject(params, function(err, data) {
      if (err) {
        reject({ error: "Could not get S3 Object"})
      } else {
        resolve(JSON.parse(data.Body.toString()));
      };
    })
  })
}
