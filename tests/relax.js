var fs = require('fs');

var mongoose = require('mongoose');

// Bootstrap models
var models_path = '../app/models';
require('../app/models/relax');

var relax = mongoose.model('relax'),
    should   = require('should');

describe('attribute map check', function() {

  this.timeout(5000);

  it('should return an attribute map', function(done) {
  });

});
