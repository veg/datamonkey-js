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


//Get all sequences:
//curl -i -X GET http://localhost:3000/sequences
//Get sequence with _id value of 5069b47aa892630aae000007 (use a value that exists in your database):
//curl -i -X GET http://localhost:3000/sequences/5069b47aa892630aae000007
//Delete sequence with _id value of 5069b47aa892630aae000007:
//curl -i -X DELETE http://localhost:3000/sequences/5069b47aa892630aae000007
//Add a new sequence:
//curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "New sequence", "year": "2009"}' http://localhost:3000/sequences
//Modify sequence with _id value of 5069b47aa892630aae000007:
//curl -i -X PUT -H 'Content-Type: application/json' -d '{"name": "New sequence", "year": "2010"}' http://localhost:3000/sequences/5069b47aa892630aae000007
var app = require('../server')
  , request = require('supertest');

describe('sequences', function(){
    it('Should return all sequences', function(done){
      app.use(function(req, res){
        req.accepted[0].value.should.equal('application/json');
        req.accepted[1].value.should.equal('text/html');
        res.end();
      });

      request(app)
      .get('/sequences/')
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
        .get('/sequences/50d3a9624f0cdc5372000002')
        .expect(200, done);
      })
    })
})
