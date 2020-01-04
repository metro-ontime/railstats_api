export const prepareNetworkData = data => {
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
    return windows.map(i => {
      return currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed > (previousValue[`${i}_min`] && previousValue[`${i}_min`].percent_ontime || null) ?
        {
          line: currentValue.name,
          percent_ontime: currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed
        } :
        previousValue[`${i}_min`]
    })
    .reduce((obj, item, i) => {
      obj[`${i + 1}_min`] = item
      return obj
    }, {})
  });

  const leastReliable = dataObjects.reduce((previousValue, currentValue) => {
    return windows.map(i => {
      return currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed < (previousValue[`${i}_min`] && previousValue[`${i}_min`].percent_ontime || 1.01) ?
        {
          line: currentValue.name,
          percent_ontime: currentValue.ontime[`${i}_min`] / currentValue.total_arrivals_analyzed
        } :
        previousValue[`${i}_min`]
      })
      .reduce((obj, item, i) => {
        obj[`${i + 1}_min`] = item
        return obj
      }, {})
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
