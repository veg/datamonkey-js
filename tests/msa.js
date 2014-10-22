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
var path = require('path');
var spawn = require('child_process').spawn;

var mongoose = require('mongoose');

var setup = require('../app/node_modules/config/setup');
var globals = require('../app/node_modules/config/globals');

// Bootstrap models
require('../app/models/msa');

var Msa     = mongoose.model('Msa'),
    should  = require('should');

function get_hyphy() {
  return spawn(setup.hyphy,
               [path.join(globals.app_node_modules_dir, "lib/bfs/datareader.bf")]);
}

describe('msa datareader validation', function() {

  var Msa  = mongoose.model('Msa');

  it('should parse msa and have all properties', function(done) {
    var hyphy = get_hyphy();

    hyphy.stdout.on('data', function (data) {
      var results = JSON.parse(data);

      //Ensure that all information is there
      results.should.have.property('FILE_INFO');
      results.FILE_INFO.should.have.property('partitions');
      results.FILE_INFO.should.have.property('gencodeid');
      results.FILE_INFO.should.have.property('sites');
      results.FILE_INFO.should.have.property('sequences');
      results.FILE_INFO.should.have.property('timestamp');
      results.FILE_INFO.should.have.property('goodtree');
      results.FILE_INFO.should.have.property('nj');
      results.FILE_INFO.should.have.property('rawsites');

      results.should.have.property('SEQUENCES');

      results.should.have.property('FILE_PARTITION_INFO');
      results.FILE_PARTITION_INFO.should.have.property('partition');
      results.FILE_PARTITION_INFO.should.have.property('startcodon');
      results.FILE_PARTITION_INFO.should.have.property('endcodon');
      results.FILE_PARTITION_INFO.should.have.property('span');
      results.FILE_PARTITION_INFO.should.have.property('usertree');

    });

    hyphy.stdin.write(__dirname + '/res/HIV_gp120.nex\n');
    hyphy.stdin.write('0');
    hyphy.stdin.end();
    hyphy.on('close', function (code) {
      done();
    });
  });

  it('should return an error message', function(done) {
    var hyphy = get_hyphy();

    hyphy.stdout.on('data', function (data) {
      var results = JSON.parse(data);
      results.should.have.property('error');
    });

    hyphy.stdin.write(__dirname + '/res/mangled_nexus.nex\n');
    hyphy.stdin.write('0');
    hyphy.stdin.end();

    hyphy.on('close', function (code) {
      done();
    });

  });
});


describe('msa codon translation', function() {

  it('should be a clean standard translation', function(done) {

    var msa = new Msa;
    msa.gencodeid = 0;
    fs.writeFileSync(msa.filepath, fs.readFileSync('./tests/res/Flu.fasta'));

    msa.aminoAcidTranslation(function(err, result) {

      fs.readFile('./tests/res/Flu.aa', function (err, data) {
        result.should.equal(data.toString());
        done();
      });


    });

  });

});

describe('hyphy friendly', function() {

  it('should not have attribute map', function(done) {

    var msa = new Msa;
    msa.gencodeid = 0;
    fs.writeFileSync(msa.filepath, fs.readFileSync('./tests/res/Flu.fasta'));
    // save attribute map
    // "map": ["unknown","unknown1","unknown2","ma3ybe_date"] should turn into
    // "map": { "0" : "unknown", "1": "unknown1", "2": "unknown2", "3": "maybe_date" }
    msa.attribute_map =  {"map": ["unknown","unknown1","unknown2","maybe_date"], "delimiter":"_"};
    (msa.hyphy_friendly.attribute_map == undefined).should.be.true;
    done();

  });

});
