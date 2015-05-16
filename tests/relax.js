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
    var random_id = crypto.randomBytes(20).toString('hex');
    mongoose.connect(setup.database + '_unit_test_' + random_id);
  })

  it('should return a well formed msa', function(done) {

    var relax = new Relax;

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


