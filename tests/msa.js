/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/


var app = require('../../server'),
  should  = require('should'),
  request = require('supertest');

describe('Upload a file', function() {

  // app.post('/msa', msa.uploadMsa);
  it('Should return object', function(done){
    app.use(function(req, res){
      req.accepted[0].value.should.equal('application/json');
      req.accepted[1].value.should.equal('text/html');
      res.end();
    });

    var params = {
      'treemode'    : '0',
      'modelstring' : '010010',
      'pvalue'      : '0.1',
      'sendmail'    : '1'
    };

    request(app)
    .post('/msa/')
    .set('Accept', 'application/json')
    .send(params)
    .expect(500)
    .expect('content-type', 'application/json; charset=utf-8')
    .end(function(err, res){
      console.log(res.body);
      if (err) return done(err);
      if (!res.body.error) {
        err = "Incorrect JSON returned: " + res.body.error;
        done(err);
        if(res.body.error.indexOf("No File") == -1) {
          var err = "Incorrect body response: " + res.body;
          done(err);
        }
      }
      done();
    });
  });

})

 app.get('/msa/:id', msa.findById);
describe('Should return object specified by id', function() {

  it('should return object', function(done){
    app.use(function(req, res){
      req.accepted.should.have.length(0);
      res.end();
    });

  app.put('/msa/:id', msa.updateMsa);
    request(app)
    .get('/msa/')
    .expect(200, done);
  });

});

// app.put('/msa/:id', msa.updateMsa);
describe('Should return object specified by id', function() {

  it('should return object', function(done){
    app.use(function(req, res){
      req.accepted.should.have.length(0);
      res.end();
    });

  app.put('/msa/:id', msa.updateMsa);
    request(app)
    .get('/msa/')
    .expect(200, done);
  });

});

// app.delete('/msa/:id', msa.deleteMsa);
describe('when there is an id specified', function() {

  it('should return object', function(done){
    app.use(function(req, res){
      req.accepted.should.have.length(0);
      res.end();
    });

  app.put('/msa/:id', msa.updateMsa);
    request(app)
    .get('/msa/50d3a9624f0cdc5372000002')
    .expect(200, done);
  });

});


