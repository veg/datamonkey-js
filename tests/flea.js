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
    Q = require('q'),
    _ = require('underscore'),
    setup = require('../config/setup'),
    globals = require('../config/globals'),
    helpers     = require( __dirname + '/../lib/helpers.js');

var mongoose = require('mongoose');
var models_path = '../app/models';

require(path.join(__dirname,'../app/models/flea'));

var Flea    = mongoose.model('Flea'),
    Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('create and save job', function() {

  var flea = new Flea;

  before(function(done) {
    this.timeout(9000);

    // runs before all tests in this block
    var random_id = crypto.randomBytes(4).toString('hex');
    var random_database = setup.database + '_unit_test_' + random_id;
    mongoose.connect(random_database);


    var datatype  = 0;
    var gencodeid = globals.genetic_code[0];
    var msas = [];

    var fn1 = path.join(__dirname, '/res/flea/PC64_V00_small.fastq'),
        fn2 = path.join(__dirname, '/res/flea/PC64_V12_small.fastq'),
        fn3 = path.join(__dirname, '/res/flea/PC64_V30_small.fastq');

    var frenquencies_fn = path.join(__dirname, '/res/flea/frequencies.json'),
        rates_fn = path.join(__dirname, '/res/flea/rates.json'),
        sequences_fn = path.join(__dirname, '/res/flea/sequences.json'),
        trees_fn = path.join(__dirname, '/res/flea/trees.json');

    var new_date = new Date();

    var flea_files = [{'fn' : fn1, 'visit_code' : 'V01', 'visit_date': new_date}, 
                      {'fn' : fn2, 'visit_code' : 'V01', 'visit_date': new_date}, 
                      {'fn' : fn3, 'visit_code' : 'V01', 'visit_date': new_date} ];

    // Parse each fastq
    flea_files.forEach(function(flea_file) {

      Msa.parseFile(flea_file.fn, datatype, gencodeid, function(err, msa) {
        console.log(err);

        msa.visit_code = flea_file.visit_code;
        msa.visit_date = flea_file.visit_date;
        msa.original_filename = path.basename(flea_file.fn);
        msas.push(msa);

        if(msas.length == flea_files.length) {

          flea.msas = msas;

          // Save results files
          var frequency_promise = Q.nfcall(fs.readFile, frenquencies_fn, "utf-8");
          var rates_promise = Q.nfcall(fs.readFile, rates_fn, "utf-8");
          var sequences_promise = Q.nfcall(fs.readFile, sequences_fn, "utf-8");
          var trees_promise = Q.nfcall(fs.readFile, trees_fn, "utf-8");

          var promises = [ frequency_promise, rates_promise, sequences_promise, trees_promise];

          Q.allSettled(promises)
          .then(function (results) {
              flea.frequencies = results[0].value;
              flea.rates = results[1].value;
              flea.sequences = results[2].value;
              flea.trees = results[3].value;
              flea.save(function (err, flea_result) {

                  var done_after_three = _.after(msas.length, done);

                  fs.mkdirSync(flea.filedir);

                  msas.forEach(function (flea_file) {
                    var current_location = path.join(__dirname, '/res/flea/', flea_file.original_filename);
                    var final_dest =  path.join(flea.filedir, flea_file._id + '.fastq');
                    helpers.copyFile(current_location, final_dest, done_after_three);
                  });

              });
            });

        }
      });
    });


  });

  it('get the filesize of the tarball', function(done) {
    this.timeout(5000);

    // pack flea
    var stream = Flea.pack(flea);
    stream.on('close', function() {
      flea.filesize(function(err, bytes) {
        bytes.should.be.equal(5103616);
        done();
      });
    });
  });


  it('should return a well formed flea with results', function(done) {
    done();
  });

  after(function(done){
      mongoose.connection.close();
      done();
  });


});
