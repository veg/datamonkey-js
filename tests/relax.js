/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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

var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    setup = require('../config/setup'),
    globals = require('../config/globals');

var mongoose = require('mongoose');
var models_path = '../app/models';

require('../app/models/msa');
require('../app/models/relax');

var Relax   = mongoose.model('Relax'),
    Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('create and save job', function() {

  before(function() {

    // runs before all tests in this block
    var random_id = crypto.randomBytes(4).toString('hex');
    var random_database = setup.database + '_unit_test_' + random_id;
    mongoose.connect(random_database);

  })

  it('should return a well formed msa', function(done) {

    var relax = new Relax();

    var datatype  = 0;
    var gencodeid = 0;
    var fn = path.join(__dirname, '/res/Flu.fasta');

    Msa.parseFile(fn, datatype, gencodeid, function(err, result) {
      relax.msa = result;
      relax.save(function (err, relax_result) {
        (err === null).should.be.true;
        done();
      });
    });

  });

  after(function(done){
      //clear out db
      mongoose.connection.db.dropDatabase();
      mongoose.connection.close();
      done();
  });

});


