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

var fs = require('fs');

var mongoose = require('mongoose');

// Bootstrap models
var models_path = ROOT_PATH + '/app/models';

var Msa     = mongoose.model('Msa'),
    should  = require('should');

// app.post('/msa/:msaid/:type', analysis.invokeJob);
describe('MSA Model tests', function() {

  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(setup.database, done);
  });

  it('mail validation', function(done) {

    var Msa  = mongoose.model('Msa');

    var msa  = new Msa({
      msaid   : 'upload.dupe.1',
      content : 'finished',
      mailaddr : 'sweaver@ucsd.edu',
    });

    var Analysis = mongoose.model('Meme');

    var type = 'meme';
    var meme = new Analysis({
      msaid    : 'upload.958520133127023.1',
      id       : 1,
      type     : type,
      status   : 'finished',
    });

    msa.save(function (err, result) {
      done();
    });
  });

  it('No dupes', function(done) {
    var Msa  = mongoose.model('Msa');

    var msa  = new Msa({
      msaid   : 'upload.dupe.1',
      content : 'finished'
    });

    msa.save(function (err, result) {
      msa.save(function (err, result) {
        err.code.should.equal(11000);
        done();
      });
    });
  });
});

