import S3 from 'aws-sdk/clients/s3';
import { prepareNetworkData } from './lib/dataHelpers';

export class DB {
  constructor(config) {
    this.s3 = new S3();
    this.bucket = config.BUCKET;
    this.summary_prefix = config.SUMMARY_PREFIX;
    this.schedule_prefix = config.SCHEDULE_PREFIX;
    this.tracking_prefix = config.TRACKING_PREFIX;
    this.metro_agency = config.METRO_AGENCY;
    if (config.PUBLIC_BUCKET) {
      this.whenListAllObjects = whenListAllObjectsPublic(this.s3);
      this.whenGotS3Object = whenGotS3ObjectPublic(this.s3);
    } else {
      this.whenListAllObjects = whenListAllObjects(this.s3);
      this.whenGotS3Object = whenGotS3Object(this.s3);
      this.whenGotS3ObjectStream = whenGotS3ObjectStream(this.s3);
    }
  }

  getAvailableSummaryDates() {
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

  getLatestLineStats(line) {
    const params = { Bucket: this.bucket, Prefix: this.summary_prefix };
    return this.whenListAllObjects(params)
      .then(objects => {
        const mostRecent = objects[objects.length - 1];
        return { Bucket: this.bucket, Key: mostRecent };
      })
      .then(this.whenGotS3Object)
      .then(data => data[`${line}_${this.metro_agency}`])
  }

  getLineStatsForDate(date, line) {
    const params = { Bucket: this.bucket, Key: `${this.summary_prefix}/${this.metro_agency}/${date}.json` };
    return this.whenGotS3Object(params).then(data => {
      return data[`${line}_${this.metro_agency}`];
    }).catch(err => ({ error: `Couldn't get data for line ${line} on date ${date}` }));
  }

  getLatestNetworkStats() {
    const params = { Bucket: this.bucket, Prefix: this.summary_prefix };
    return this.whenListAllObjects(params)
      .then(objects => {
        const mostRecent = objects[objects.length - 1];
        return { Bucket: this.bucket, Key: mostRecent };
      })
      .then(this.whenGotS3Object)
      .then(data => prepareNetworkData(data));
  }

  getScheduleDates(line) {
    const params = { Bucket: this.bucket, Prefix: `${this.schedule_prefix}/${this.metro_agency}/${line}` };
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

  getLineScheduleForDate(line, date) {
    const params = { Bucket: this.bucket, Key: `${this.schedule_prefix}/${this.metro_agency}/${line}/${date}.csv` };
    return this.whenGotS3ObjectStream(params)
  }

  getLatestSchedule(line) {
    const params = { Bucket: this.bucket, Prefix: `${this.schedule_prefix}/${this.metro_agency}/${line}` };
    return this.whenListAllObjects(params)
      .then(objects => {
        const mostRecent = objects[objects.length - 1];
        return { Bucket: this.bucket, Key: mostRecent };
      })
      .then(this.whenGotS3ObjectStream)
  }

  getLineTrackingForDate(line, date) {
    const params = { Bucket: this.bucket, Key: `${this.tracking_prefix}/${this.metro_agency}/${line}/${date}.csv`};
    return this.whenGotS3ObjectStream(params)
  }

  getTrackingDates(line) {
    const params = { Bucket: this.bucket, Prefix: `${this.tracking_prefix}/${this.metro_agency}/${line}` };
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

  getLatestLineTracking(line) {
    const params = { Bucket: this.bucket, Prefix: `${this.tracking_prefix}/${this.metro_agency}/${line}` };
    return this.whenListAllObjects(params)
      .then(objects => {
        const mostRecent = objects[objects.length - 1];
        return { Bucket: this.bucket, Key: mostRecent };
      })
      .then(this.whenGotS3ObjectStream)
  }

  getNetworkHistory() {
    const params = { Bucket: this.bucket, Prefix: this.summary_prefix };
    return this.whenListAllObjects(params)
      .then(objects => {
        const promises = objects.map(obj => this.whenGotS3Object({ Bucket: this.bucket, Key: obj }))
        return Promise.all(promises)
      })
      .then(data => {
        const allLineData = data.map(datum => prepareNetworkData(datum))
        return [data, allLineData];
      })
  }

  getNetworkStatsForDate(date) {
    const params = { Bucket: this.bucket, Key: `${this.summary_prefix}/${this.metro_agency}/${date}.json`};
    return this.whenGotS3Object(params)
      .then(data => prepareNetworkData(data))
      .catch(err => ({ error: `Couldn't get data for ${date}`}));
  }
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

const whenGotS3ObjectStream = s3 => params => {
  return new Promise((resolve, reject) => {
    const s3Stream = s3.getObject(params).createReadStream()
    resolve(s3Stream)
  })
}
