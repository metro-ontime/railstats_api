var assert = require('assert');

let prepareNetworkData, dataHelpers, raw, processed;

describe('prepare network data', function() {
  before(function() {
    dataHelpers = require('../../src/lib/dataHelpers.js');
    prepareNetworkData = dataHelpers.prepareNetworkData;
    raw = require('../fixtures/sampleAllSummaries');
    processed = require('../fixtures/sampleNetworkSummary');
  });

  it('prepares the network data correctly', function() {
    const prepared = prepareNetworkData(raw);
    assert.deepEqual(prepared, processed);
  })
});
