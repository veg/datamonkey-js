var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    setup = require('../config/setup'),
    globals = require('../config/globals');

var mongoose = require('mongoose');
var models_path = '../app/models';

require('../app/models/flea');

var Flea    = mongoose.model('Flea'),
    Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('create and save job', function() {

  before(function() {
    // runs before all tests in this block
    mongoose.connect(setup.database + '_unit_test');
  })


  it('should return a well formed flea with results', function(done) {

    var flea = new Flea;
    var datatype  = 0;
    var gencodeid = globals.genetic_code[0];
    var msas = [];

    var fn1 = __dirname + '/res/flea/PC64_V00_small.fastq';
    var fn2 = __dirname + '/res/flea/PC64_V12_small.fastq';
    var fn3 = __dirname + '/res/flea/PC64_V30_small.fastq';

    var frenquencies_fn = __dirname + '/res/flea/frequencies.json';
    var rates_fn = __dirname + '/res/flea/rates.json';
    var sequences_fn = __dirname + '/res/flea/sequences.json';
    var trees_fn = __dirname + '/res/flea/trees.json';

    var new_date = new Date();

    var flea_files = [{'fn' : fn1, 'visit_code' : 'V01', 'visit_date': new_date}, 
                      {'fn' : fn2, 'visit_code' : 'V01', 'visit_date': new_date}, 
                      {'fn' : fn3, 'visit_code' : 'V01', 'visit_date': new_date} ];

    // Parse each fastq
    flea_files.forEach(function(flea_file) {

      Msa.parseFile(flea_file.fn, datatype, gencodeid, function(err, msa) {

        msa.visit_code = flea_file.visit_code;
        msa.visit_date = flea_file.visit_date;
        msa.original_filename = path.basename(flea_file.fn);
        msas.push(msa);

        if(msas.length == flea_files.length) {

          var flea = new Flea;
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
                  flea_result.msas.length.should.equal(3);
                  console.log(flea._id);
                  done();
              });
            });

        }
      });
    });
  });

  after(function(done){
      //clear out db
      mongoose.connection.close();
      done();
  });


});
