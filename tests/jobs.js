//Get all jobs:
//curl -i -X GET http://localhost:3000/jobs
//Get job with _id value of 5069b47aa892630aae000007 (use a value that exists in your database):
//curl -i -X GET http://localhost:3000/jobs/5069b47aa892630aae000007
//Delete job with _id value of 5069b47aa892630aae000007:
//curl -i -X DELETE http://localhost:3000/jobs/5069b47aa892630aae000007
//Add a new job:
//curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "New job", "year": "2009"}' http://localhost:3000/jobs
//Modify job with _id value of 5069b47aa892630aae000007:
//curl -i -X PUT -H 'Content-Type: application/json' -d '{"name": "New job", "year": "2010"}' http://localhost:3000/jobs/5069b47aa892630aae000007
var app = require('../server')
  , request = require('supertest');

describe('jobs', function(){
    it('Should return all jobs', function(done){
      app.use(function(req, res){
        req.accepted[0].value.should.equal('application/json');
        req.accepted[1].value.should.equal('text/html');
        res.end();
      });

      request(app)
      .get('/jobs/')
      .set('Accept', 'text/html;q=.5, application/json')
      .expect(200, done);
    })

    describe('when there is an id specified', function(){

      it('should return object', function(done){
        app.use(function(req, res){
          req.accepted.should.have.length(0);
          res.end();
        });

        request(app)
        .get('/jobs/50d3a9624f0cdc5372000002')
        .expect(200, done);
      })
    })
})
