var fs = require('fs'),
    setup = require('../config/setup'),
    globals = require('../config/globals');

var mongoose = require('mongoose');

// Bootstrap models
var models_path = '../app/models';

require('../app/models/msa');
require('../app/models/relax');

var Relax   = mongoose.model('Relax'),
    Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('create and save job', function() {

  mongoose.connect(setup.database + '_unit_test');

  var Relax   = mongoose.model('Relax');
  var Msa     = mongoose.model('Msa');

  it('should return a well formed msa', function(done) {

    var relax = new Relax;

    var datatype  = 0;
    var gencodeid = globals.genetic_code[0];
    var fn = __dirname + '/res/Flu.fasta';

    Msa.parseFile(fn, datatype, gencodeid, function(err, result) {
      relax.msa = result;
      relax.save(function (err, relax_result) {
        (err === null).should.be.true;
        done();
      });
    });
  });

});
