import S3 from 'aws-sdk/clients/s3';
const s3 = new S3();

const whenListAllObjects = (params) => {
  return new Promise((resolve) => {
    s3.makeUnauthenticatedRequest('listObjects', params, function (err, data) {
      if (err) console.log(err);
      else {
        const objects = data.Contents.map(file => file.Key).sort();
        resolve(objects);
      };
    });
  });
};

const whenGotS3Object = (params) => {
  return new Promise((resolve) => {
    s3.makeUnauthenticatedRequest('getObject', params, function (err, data) {
      if (err) console.log(err);
      else {
        resolve(JSON.parse(data.Body.toString()));
      };
    });
  });
};

const getLatestLineStats = (lineId) => {
  return new Promise((resolve) => {
    const listParams = {Bucket: 'h4la-metro-performance', Prefix: 'data/summaries'};
    whenListAllObjects(listParams).then((objects) => {
      const mostRecent = objects[objects.length - 1];
      const objectParams = {Bucket: 'h4la-metro-performance', Key: mostRecent};
      whenGotS3Object(objectParams).then((allData) => {
        const data = allData[`${lineId}_lametro-rail`];
        resolve(data);
      });
    });
  });
};

const getLatestNetworkStats = () => {
  return new Promise((resolve) => {
    const listParams = {Bucket: 'h4la-metro-performance', Prefix: 'data/summaries'};
    whenListAllObjects(listParams).then(lineObjects => {
      let mostRecent = lineObjects[lineObjects.length - 1]
      const objectParams = {Bucket: 'h4la-metro-performance', Key: mostRecent};
      const data = whenGotS3Object(objectParams).then(data => {
        const preparedData = prepareData(data);
        resolve(preparedData);
      });
    });
  });
};

const prepareData = data => {
  const dataObjects = Object.keys(data).map((key) => {
    return data[key]
  });
  const windows = Array.from({length: 5}, (k, n) => n + 1);

  let totalsOntime = windows.map(windowSize => {
    const totalOntimeForWindow = dataObjects.reduce((acc, currentValue) => {
      return currentValue["ontime"][`${windowSize}_min`] + acc
    }, dataObjects[0]["ontime"][`${windowSize}_min`]);
    return { window: windowSize, n: totalOntimeForWindow }
  });

  totalsOntime = totalsOntime.reduce((map, obj) => {
    map[`${obj.window}_min`] = obj.n;
    return map
  }, {});

  const totalArrivals = dataObjects.reduce((acc, currentValue) => {
    return currentValue["total_arrivals_analyzed"] + acc
  }, dataObjects[0]["total_arrivals_analyzed"]);

  const totalScheduled = dataObjects.reduce((acc, currentValue) => {
    return currentValue["total_scheduled_arrivals"] + acc
  }, dataObjects[0]["total_scheduled_arrivals"]);

  const sumMeanTimeBetween = dataObjects.reduce((acc, currentValue) => {
    return currentValue["mean_time_between"] + acc
  }, dataObjects[0]["mean_time_between"]);
  const overallMeanTimeBetween = sumMeanTimeBetween / dataObjects.length;

  const timestamp = dataObjects[0]["timestamp"];

  const overallData = {
    ontime: totalsOntime,
    total_arrivals_analyzed: totalArrivals,
    total_scheduled_arrivals: totalScheduled,
    mean_time_between: overallMeanTimeBetween,
    timestamp: timestamp
  };
  return overallData;
};

const db = {};
db.getLatestLineStats = getLatestLineStats;
db.getLatestNetworkStats = getLatestNetworkStats

export default callback => {
	// connect to a database if needed, then pass it to `callback`:
	callback(db);
}
