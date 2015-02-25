var fs = require('fs'),
    setup = require('../config/setup'),
    globals = require('../config/globals');

var mongoose = require('mongoose');

// Bootstrap models
var models_path = '../app/models';

require('../app/models/msa');
require('../app/models/longenv');

var Relax   = mongoose.model('Relax'),
    Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('create and save job', function() {


});
