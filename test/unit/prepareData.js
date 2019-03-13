var assert = require('assert');

let db, raw, processed;

describe('prepare network data', function() {
  before(function() {
    db = require('../../src/db');
    raw = require('../fixtures/sampleAllSummaries');
    processed = require('../fixtures/sampleNetworkSummary');
  });

  it('prepares the network data correctly', function() {
    const prepared = db.prepareNetworkData(raw);
    assert.deepEqual(prepared, processed);
  })
});
