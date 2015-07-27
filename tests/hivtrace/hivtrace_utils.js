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

require('../../public/assets/lib/datamonkey/hivtrace/misc.js'),
require('../../public/assets/lib/d3/d3.js');

var fs     = require('fs'),
    path   = require('path'),
    should = require('should');


describe('convert object to csv', function() {

  var trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './test.trace.json')));
  var results = datamonkey.hivtrace.convert_to_csv(trace_results);
  var parsed_obj = d3.csv.parse(results);

  it('elements should not be empty', function(done) {

    // ensure each key exists and has a value
    function hasNonEmptyElements(element, index, array) {
      return (Boolean(element.seqid) && 
              Boolean(element.cluster) && 
              Boolean(element.degree) && 
              Boolean(element.is_contaminant));
    }

    parsed_obj.every(hasNonEmptyElements).should.be.true;
    done();

  });

  it('elements should mark contaminants correctly', function(done) {

    // ensure that NL4-3 and HXB2_env are tagged as contaminants
    var contaminants = parsed_obj.filter(function(elem){return elem.is_contaminant == 'true'});
    var contaminant_ids = contaminants.map(function(elem) {return elem['seqid']})
    contaminant_ids.indexOf('NL4-3').should.not.be.equal(-1);
    contaminant_ids.indexOf('HXB2_env').should.not.be.equal(-1);
    done();

  });

});
