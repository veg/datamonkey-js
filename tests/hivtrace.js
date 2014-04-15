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
var models_path = '../app/models';
require('../app/models/hivtrace');

var HivTrace = mongoose.model('HivTrace'),
    should   = require('should');

describe('attribute map check', function() {

  it('should return an attribute map', function(done) {
    var fn = "/home/sweaver/datamonkey/datamonkey-js-dev/tests/res/HIV_B_pol_10k.fa";
    HivTrace.createAttributeMap(fn, function(err, result) {
      err.should.not.be.ok;
      result['_'].length.should.be.exactly(4);
      result['_'][0].should.be.exactly("subtype");
      result['_'][1].should.be.exactly("country");
      result['_'][2].should.be.exactly("id");
      result['_'][3].should.be.exactly("date");
      done();
    });

  });

  it('should return an error', function(done) {
    var fn = "/home/sweaver/datamonkey/datamonkey-js-dev/tests/res/BAD_HIV_B_pol_10k.fa";
    HivTrace.createAttributeMap(fn, function(err, result) {
      err.failed_headers[0].should.eql('BUS_M17451_1983');
      done();
    });

  });

  it('should return an error', function(done) {
    var fn = "/home/sweaver/datamonkey/datamonkey-js-dev/tests/res/Flu.fasta";
    HivTrace.createAttributeMap(fn, function(err, result) {
      //console.log(result);
      done();
    });

  });

});

