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
        const preparedData = prepareNetworkData(data);
        resolve(preparedData);
      });
    });
  });
};

const getNetworkHistory = () => {
  return new Promise((resolve) => {
    const listParams = {Bucket: 'h4la-metro-performance', Prefix: 'data/summaries'};
    whenListAllObjects(listParams).then(lineObjects => {
      Promise.all(lineObjects.map(item => {
        return whenGotS3Object({Bucket: 'h4la-metro-performance', Key: item})
      }))
      .then(data => {
        const allLineData = data.map(datum => prepareNetworkData(datum))
        resolve([data, allLineData]);
      })
    });
  });
};

const prepareNetworkData = data => {
  const dataObjects = Object.keys(data).map((key) => {
    const datum = data[key]
    datum.name = key
    return datum
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

  const mostFrequent = dataObjects.reduce((previousValue, currentValue) => {
    const line = currentValue["mean_time_between"] < previousValue["mean_time_between"] ? currentValue : previousValue
    return { name: line.name.slice(0,3), mean_time_between: line.mean_time_between }
  });

  const leastFrequent = dataObjects.reduce((previousValue, currentValue) => {
    const line = currentValue["mean_time_between"] > previousValue["mean_time_between"] ? currentValue : previousValue
    return { name: line.name.slice(0,3), mean_time_between: line.mean_time_between }
  });

  const mostReliable = dataObjects.reduce((previousValue, currentValue) => {
    const minutes = windows.map(i => {
      return currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed > (previousValue[`min_${i}`] && previousValue[`min_${i}`].percent_ontime || null) ?
        {
          line: currentValue.name,
          percent_ontime: currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed
        } :
        previousValue[`min_${i}`]
    })
    return {
      min_1: minutes[0],
      min_2: minutes[1],
      min_3: minutes[2],
      min_4: minutes[3],
      min_5: minutes[4]
    };
  });

  const leastReliable = dataObjects.reduce((previousValue, currentValue) => {
    const minutes = windows.map(i => {
      return currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed < (previousValue[`min_${i}`] && previousValue[`min_${i}`].percent_ontime || 1.01) ?
        {
          line: currentValue.name,
          percent_ontime: currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed
        } :
        previousValue[`min_${i}`]
    })
    return {
      min_1: minutes[0],
      min_2: minutes[1],
      min_3: minutes[2],
      min_4: minutes[3],
      min_5: minutes[4]
    };
  });

  const timestamp = dataObjects[0]["timestamp"];
  const date = dataObjects[0]["date"];

  const overallData = {
    ontime: totalsOntime,
    total_arrivals_analyzed: totalArrivals,
    total_scheduled_arrivals: totalScheduled,
    mean_time_between: overallMeanTimeBetween,
    timestamp: timestamp,
    most_frequent: mostFrequent,
    least_frequent: leastFrequent,
    most_reliable: mostReliable,
    least_reliable: leastReliable,
    date: date
  };
  return overallData;
};

const db = {};
db.getLatestLineStats = getLatestLineStats;
db.getLatestNetworkStats = getLatestNetworkStats;
db.prepareNetworkData = prepareNetworkData;
db.getNetworkHistory = getNetworkHistory;

module.exports = db
