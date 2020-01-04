var assert = require('assert');
const request = require('supertest');

let app;

describe.skip('GET /line', function() {
  before(function() {
    app = require('../../src/index');
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

  it('responds with network data', function() {
    return request(app)
      .get('/network')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["ontime", "total_arrivals_analyzed", "total_scheduled_arrivals", "mean_time_between", "timestamp", "most_frequent", "least_frequent", "most_reliable", "least_reliable", "date"])
      });
  });

  it('responds with network data for date 2019-08-15', function() {
    return request(app)
      .get('/network?date=2019-08-15')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["ontime", "total_arrivals_analyzed", "total_scheduled_arrivals", "mean_time_between", "timestamp", "most_frequent", "least_frequent", "most_reliable", "least_reliable", "date"]);
        assert(response.body.date === '2019-08-15')
      });
  });


  it('responds with could not find data for date 2100-08-15', function() {
    return request(app)
      .get('/network?date=2100-08-15')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["error"]);
        assert(response.body.error === "Couldn't get data for 2100-08-15");
      });
  });


  it('responds with line info for line 801', function() {
    return request(app)
      .get('/line/801')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["total_arrivals_analyzed", "total_scheduled_arrivals", "coverage", "ontime", "mean_secs", "std_secs", "mean_time_between", "date", "timestamp"])
      });
  });

  it('responds with line info for line 801 and date 2019-08-15', function() {
    return request(app)
      .get('/line/801?date=2019-08-15')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert.deepEqual(Object.keys(response.body), ["total_arrivals_analyzed", "total_scheduled_arrivals", "coverage", "ontime", "mean_secs", "std_secs", "mean_time_between", "date", "timestamp"])
        assert(response.body.date === '2019-08-15')
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

  it('respondes with an array', function() {
    request(app)
      .get('/dates')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(Array.isArray(response.body.dates))
      })
  })
});

