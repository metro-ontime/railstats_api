var assert = require('assert');
const request = require('supertest');

let app;

describe('GET /line', function() {
  before(function() {
    app = require('../src/index');
  });

  after(function() {
    app.close();
  });

  it('responds with json', function(done) {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done());
  });

  it('responds with lines list', function() {
    return request(app)
      .get('/line')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(response => {
        assert.deepEqual(response.body, { "lines": ["801", "802", "803", "804", "805", "806"] })
      });
  });

  it('responds with line 801 data json', function() {
    return request(app)
      .get('/network')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["ontime", "total_arrivals_analyzed", "total_scheduled_arrivals", "mean_time_between", "timestamp"])
      });
  });

  it('responds with Not found', function(done) {
    request(app)
      .get('/line/800')
      .set('Accept', 'application/json')
      .expect(404)
      .end(function(err, res) {
        done(err)
      })
  });
});
