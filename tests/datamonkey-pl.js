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

var setup   = require('../config/utsetup');
var fs = require('fs');

ROOT_PATH = setup.rootpath;
SPOOL_DIR = setup.spooldir;
HOST      = setup.host;

var mongoose = require('mongoose');

// Bootstrap models
var models_path = ROOT_PATH + '/app/models';

fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
});

var Msa     = mongoose.model('Msa'),
    should  = require('should'),
    dpl     = require( ROOT_PATH + '/lib/datamonkey-pl.js');

// app.post('/msa/:msaid/:type', analysis.invokeJob);
describe('Parse results unit test', function() {

  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(setup.database, done);
  });

  it("Parse Meme", function(done) {
    this.timeout(5000);

    var Msa  = mongoose.model('Msa');

    var msa  = new Msa({
      msaid   : 'upload.958520133127023.1',
      content : 'finished'
    });

    var Analysis = mongoose.model('Meme');

    var type = 'meme';
    var meme = new Analysis({
      msaid  : 'upload.958520133127023.1',
      id     : 1,
      type   : type,
      status : 'finished',
    });

    //Invalid parameter passed
    //dpl.parseResults("beavis");
    //result = dpl.parseResults(meme);

    msa.save(function (err, result) {
      meme.save(function (err, result) {
        dpl.parseResults(result, function(analysis) {
          analysis.memeresults.length.should.equal(875);
          done();
        });
      });
    });
  });

  it("Parse BSREL", function(done) {
    this.timeout(5000);

    var Msa  = mongoose.model('Msa');

    var msa  = new Msa({
      msaid   : 'upload.321598752225620.1',
      content : 'finished'
    });

    var Analysis = mongoose.model('Bsrel');

    var type = 'bsrel';
    var meme = new Analysis({
      msaid  : 'upload.321598752225620.1',
      id     : 1,
      type   : type,
      status : 'finished',
    });

    msa.save(function (err, result) {
      meme.save(function (err, result) {
        dpl.parseResults(result, function(analysis) {
          analysis.bsrresults.length.should.equal(9);
          done();
        });
      });
    });
  });

  after(function(done) {
    var Analysis = mongoose.model('Bsrel');
    Analysis.remove({}, function(err) { 
       done();
     });
  });
});

